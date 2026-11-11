---
title: "textdiffnext counts the way JavaScript already counts"
date: "2026-11-10"
description: "A UTF-16-native rewrite of Google diff-match-patch. Patch coordinates stay in code units, unpaired surrogates serialize as %uXXXX, and a 45 KB file stops silently corrupting."
slug: "how-i-built-textdiffnext"
published: true
tags: ["TypeScript", "Unicode", "Open Source"]
author: "Dao Quang Truong"
coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1000"
---

`'😀'.length` is 2. JavaScript strings are UTF-16 code units. [`@sanity/diff-match-patch`](https://github.com/sanity-io/diff-match-patch) still spoke UTF-8 byte offsets, then translated. On a 45 KB TypeScript file with 115 hunks that translation clamped a target and rewrote the wrong function. [textdiffnext](https://github.com/2tsoftwareapp/textdiffnext) deletes the translation.

> Patch objects and patch text addressed in UTF-16 code units, removing the UTF-8 byte-counting and index-translation layer that upstream ran on every patch operation.

That line is in the changelog. The library commit is [`bdf63a3`](https://github.com/2tsoftwareapp/textdiffnext/commit/bdf63a3).

## One coordinate system

![A JavaScript string is UTF-16. textdiffnext diffs, patches, and serializes in that system. The UTF-8 helpers are gone.](/blog/textdiffnext-utf16.svg)

The patch object still has fields named `utf8Start1`. They are not UTF-8. The names stayed so a caller that read Sanity's shape does not crash. The comment in [`createPatchObject.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/createPatchObject.ts) is the contract.

```ts
export interface Patch {
  diffs: Diff[]

  start1: number
  start2: number
  length1: number
  length2: number

  // Deprecated Sanity-shaped aliases. In TextDiffNext these contain UTF-16 code-unit
  // coordinates, despite their names. Do not use them as UTF-8 byte offsets.
  /** @deprecated UTF-16 alias of start1; not a UTF-8 byte offset. */
  utf8Start1?: number
  /** @deprecated UTF-16 alias of start2; not a UTF-8 byte offset. */
  utf8Start2?: number
  /** @deprecated UTF-16 alias of length1; not a UTF-8 byte length. */
  utf8Length1?: number
  /** @deprecated UTF-16 alias of length2; not a UTF-8 byte length. */
  utf8Length2?: number
}
```

`make` writes the aliases as copies of the UTF-16 counters. There is no `countUtf8Bytes` import.

```ts
if (!patchDiffLength && diffType !== DIFF_EQUAL) {
  patch.start1 = charCount1
  patch.start2 = charCount2
  patch.utf8Start1 = charCount1
  patch.utf8Start2 = charCount2
}
```

At the end of [`make.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/make.ts):

```ts
for (let i = 0; i < patches.length; i++) {
  const p = patches[i]
  p.utf8Start1 = p.start1
  p.utf8Start2 = p.start2
  p.utf8Length1 = p.length1
  p.utf8Length2 = p.length2
}
```

## The patch text uses the same numbers

Unified-diff headers in [`stringify.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/stringify.ts) are `start1` / `length1`, not `utf8Start1`.

```ts
export function stringifyPatch(patch: Patch): string {
  const {length1, length2, start1, start2, diffs} = patch

  let coords1: string
  if (length1 === 0) {
    coords1 = `${start1},0`
  } else if (length1 === 1) {
    coords1 = `${start1 + 1}`
  } else {
    coords1 = `${start1 + 1},${length1}`
  }
```

`apply` used to call `adjustIndiciesToUcs2(patches, text)` before splicing. It now copies the patch list and splices with `substring` at UTF-16 locations. `allowExceedingIndices` is accepted and ignored. The option used to let a UTF-8-to-UTF-16 conversion land past a multi-byte character instead of throwing.

```ts
export function apply(
  patches: Patch[],
  originalText: string,
  opts: Partial<ApplyPatchOptions> = {},
): PatchResult {
  if (typeof patches === 'string') {
    throw new Error('Patches must be an array - pass the patch to `parsePatch()` first')
  }

  let text = originalText
  if (patches.length === 0) {
    return [text, []]
  }

  // Deep-copy patches so that no changes are made to the originals.
  const parsed = deepCopy(patches)
```

The public name is `applyPatches`, re-exported from [`src/index.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/index.ts).

## Unpaired surrogates used to throw

`encodeURI` rejects an isolated surrogate. A split emoji in a patch body is exactly that. [`uriText.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/utils/uriText.ts) encodes those code units as `%uXXXX` and leaves paired text to `encodeURI`.

```ts
export function encodeUriText(text: string): string {
  let encoded = ''
  let chunkStart = 0
  for (let index = 0; index < text.length; index++) {
    const char = text.charAt(index)
    const unpairedHigh = isHighSurrogate(char) && !isLowSurrogate(text.charAt(index + 1))
    const unpairedLow = isLowSurrogate(char) && !isHighSurrogate(text.charAt(index - 1))
    if (unpairedHigh || unpairedLow) {
      encoded += encodeURI(text.slice(chunkStart, index))
      encoded += `%u${text.charCodeAt(index).toString(16).toUpperCase().padStart(4, '0')}`
      chunkStart = index + 1
    }
  }
  return encoded + encodeURI(text.slice(chunkStart))
}
```

Decode is the inverse: `%u` plus a surrogate range, then `String.fromCharCode`. Paired emoji still round-trip through `encodeURI`.

## The 45 KB file

The numbers are one machine, Bun 1.4.4, macOS arm64, from [`8c23050`](https://github.com/2tsoftwareapp/textdiffnext/commit/8c23050). They are not an SLA.

On `code_long` (about 45 KB, 115 hunks) Sanity reported every hunk applied and the reconstructed text was not `b`. Patch 103 wanted offset 21,341 and landed at 21,158. `ServiceHandler_135` became `ServiceHandler_133`. textdiffnext matched all 115 hunks, 21,800 characters.

On ~40 KB of JSON (`data_long`, 240 hunks) the same split: Sanity corrupted, textdiffnext matched 240/240. A 4 KB astral/CJK fixture threw `URIError: String contained an illegal UTF-16 sequence` in Sanity and passed here.

Median `makePatches` + `applyPatches` on the 45 KB file: 7.12 ms against Sanity's 8.64 ms. The speed is a side effect of not translating indices. The reason to use the fork is the 115th hunk.

```ts
import { makePatches, applyPatches } from 'textdiffnext'

const patches = makePatches(before, after)
const [next] = applyPatches(patches, before)
```

If you already store Sanity patches as UTF-8 byte offsets, this is not a drop-in. The deprecated `utf8*` fields are UTF-16 now. Convert, or keep the old library for the old files.

## References

- Repository: [2tsoftwareapp/textdiffnext](https://github.com/2tsoftwareapp/textdiffnext)
- Library: [`bdf63a3`](https://github.com/2tsoftwareapp/textdiffnext/commit/bdf63a3)
- Benchmarks and audits: [`8c23050`](https://github.com/2tsoftwareapp/textdiffnext/commit/8c23050)
- Files: [`createPatchObject.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/createPatchObject.ts), [`make.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/make.ts), [`stringify.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/stringify.ts), [`apply.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/patch/apply.ts), [`uriText.ts`](https://github.com/2tsoftwareapp/textdiffnext/blob/368e3f2/src/utils/uriText.ts)
