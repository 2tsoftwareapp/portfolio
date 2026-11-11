---
title: "semvernext says which comparator failed"
date: "2026-11-11"
description: "A zero-dependency SemVer parser that keeps node-semver's fixtures and adds explain(): the canonical range, the failed comparator, and the prerelease-tuple policy."
slug: "how-i-built-semvernext"
published: true
tags: ["TypeScript", "SemVer", "Open Source"]
author: "Dao Quang Truong"
coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1000"
---

`satisfies("2.0.0", "^1.0.0")` is `false`. That is the entire conversation node-semver will have with you. [semvernext](https://github.com/2tsoftwareapp/semvernext) still returns the boolean. It also names the comparator. The implementation is [`8ab5bcc`](https://github.com/2tsoftwareapp/semvernext/commit/8ab5bcc).

> Designed with 100% test fixture fidelity against `node-semver@7.8.6`, zero external dependencies, and built-in dependency resolution diagnostics via `explain()`.

The README now lists 133 increment rows, which is what the fixture contains. An earlier README said 144; the test iterates the array, so the wrong number never failed the suite. The fixture is the source of truth.

## Parse without a regex

![A version and a caret range become a canonical comparator set. satisfies() is a boolean. explain() keeps the failed comparator.](/blog/semvernext-explain.svg)

[`parse`](https://github.com/2tsoftwareapp/semvernext/blob/8ab5bcc/src/index.ts) walks `charCodeAt`. Leading `v` is optional. Loose mode also accepts a leading `=`. Each numeric component rejects a leading zero and anything above `Number.MAX_SAFE_INTEGER`. If the cursor is not at the end of the string, the answer is `null`.

```ts
export function parse(input: string, options: Options | boolean = {}): Version | null {
  if (typeof input !== "string" || input.length > MAX_LENGTH) return null;
  const loose = options === true || (typeof options === "object" && Boolean(options.loose));
  let cursor = 0;
  if (input.charCodeAt(0) === 118 || (loose && input.charCodeAt(0) === 61)) cursor++;
  const core: number[] = [];
  for (let component = 0; component < 3; component++) {
    const start = cursor;
    while (digit(input.charCodeAt(cursor))) cursor++;
    const text = input.slice(start, cursor);
    if (!text || (text.length > 1 && text[0] === "0") || Number(text) > MAX_SAFE) return null;
    core.push(Number(text));
    if (component < 2 && input[cursor++] !== ".") return null;
  }
```

Prerelease identifiers that are all digits become numbers. `1.2.3-beta.1+build.42` comes back with `prerelease: ["beta", 1]`. The build metadata is kept on the object and stripped from `version`, which is how SemVer 2.0.0 compares.

Range evaluation still uses a vendored `Range` / `Comparator` for `validRange`, `intersects`, and `explain`. `parse` and `satisfies` are the custom scanner. Zero *runtime* dependencies means the package.json `dependencies` map is empty, not that every byte was written here.

## explain() walks the OR-set

The result type is in the same file.

```ts
export interface ExplainBranch {
  branch: string;
  passed: boolean;
  failedComparator?: string;
  reason?: string;
}

export interface ExplainResult {
  satisfied: boolean;
  version: string | null;
  range: string | null;
  reason: string;
  branches?: ExplainBranch[];
}
```

[`explain`](https://github.com/2tsoftwareapp/semvernext/blob/8ab5bcc/src/index.ts) parses the version, constructs a `Range`, and if `r.test(v.version)` is true it stops. On failure it walks `r.set`. Each inner set is an AND of comparators. The first comparator that rejects the version becomes `failedComparator`.

```ts
for (const set of r.set) {
  const branchStr = set.map((c: any) => c.value).join(" ") || "*";
  let branchPassed = true;
  let failedComp: string | undefined;

  for (const comp of set) {
    if (!comp.test(v.version)) {
      branchPassed = false;
      failedComp = comp.value;
      break;
    }
  }

  if (branchPassed && isPrereleaseExcluded) {
    branchPassed = false;
  }

  branches.push({
    branch: branchStr,
    passed: branchPassed,
    failedComparator: failedComp,
    reason: branchPassed
      ? "Satisfied"
      : failedComp
      ? `Failed condition "${failedComp}"`
      : "Excluded by prerelease policy",
  });
}
```

`^1.0.0` canonicalizes to `>=1.0.0 <2.0.0-0`. `2.0.0` fails on `<2.0.0-0`. That string is the whole point of the function.

## The prerelease tuple rule

npm will not let `1.2.4-alpha.1` satisfy `^1.2.3` unless the range itself names a prerelease on the same major.minor.patch. semvernext copies that. The exclusion is computed before the branch walk, then applied even if every comparator would otherwise pass.

```ts
const reason = isPrereleaseExcluded
  ? `Prerelease version ${v.version} is excluded because range "${range}" does not allow prereleases on tuple (${v.major}.${v.minor}.${v.patch})`
  : `Version ${v.version} does not satisfy range "${canonRange}"`;
```

The tests in [`range.test.ts`](https://github.com/2tsoftwareapp/semvernext/blob/8ab5bcc/test/range.test.ts) lock three of the paths: a hit, a prerelease miss, a bound miss.

```ts
it("explains why version satisfies range", () => {
  const res = explain("1.2.4", "^1.2.3");
  expect(res.satisfied).toBe(true);
  expect(res.version).toBe("1.2.4");
  expect(res.range).toBe(">=1.2.3 <2.0.0-0");
});

it("explains prerelease exclusion policy", () => {
  const res = explain("1.2.4-alpha.1", "^1.2.3");
  expect(res.satisfied).toBe(false);
  expect(res.reason).toContain("prerelease");
});
```

## What "fixture fidelity" means here

`bun test` on this tree: 23 pass, 1,998 `expect()` calls. The range-parse fixture is 348 base rows times four option variants (`undefined`, `{ loose: true }`, `{ includePrerelease: true }`, both), which is 1,392. That number is real.

Also loaded and asserted: 126 range-include, 98 range-exclude, 22 valid versions, 10 invalid versions, 31 comparisons, 133 increments. Other snapshot files in `research/upstream-snapshot` are not in the bun tests. The package is not a byte-for-byte replacement of every node-semver helper. It is a parser, a range evaluator, and `explain`.

```ts
import { parse, satisfies, explain } from "semvernext";

parse("1.2.3-beta.1+build.42");
satisfies("1.2.3", "^1.0.0");
explain("2.0.0", "^1.0.0");
```

If you only need the boolean, node-semver is the library the ecosystem already has. If a lockfile conflict is a named comparator, this is the extra function. The package is not on the npm registry; build it from the repository with `bun install && bun run build`.

## References

- Repository: [2tsoftwareapp/semvernext](https://github.com/2tsoftwareapp/semvernext)
- Implementation: [`8ab5bcc`](https://github.com/2tsoftwareapp/semvernext/commit/8ab5bcc)
- Upstream pin: node-semver `v7.8.6`
- Files: [`src/index.ts`](https://github.com/2tsoftwareapp/semvernext/blob/8ab5bcc/src/index.ts), [`test/range.test.ts`](https://github.com/2tsoftwareapp/semvernext/blob/8ab5bcc/test/range.test.ts)