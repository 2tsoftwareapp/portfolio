---
title: "jsondiffnext pins the document, not the patch"
date: "2026-11-10"
description: "Three JSON diff engines, one v1 bundle. SHA-256 of RFC 8785 canonical JSON on the base and the result, then apply on a clone."
slug: "how-i-built-jsondiffnext"
published: true
tags: ["TypeScript", "JSON", "Open Source"]
author: "Dao Quang Truong"
coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1000"
---

A JSON patch that applies to the wrong document is a successful write of the wrong state. [jsondiffnext](https://github.com/2tsoftwareapp/jsondiffnext) started as a wrapper around `fast-json-patch`, `jsondiffpatch`, and `rfc6902`. The rewrite that stuck is the bundle those engines return: version 1, algorithm `sha256`, two hashes, a forward delta, an inverse delta. [`2812694`](https://github.com/2tsoftwareapp/jsondiffnext/commit/2812694) added the pins.

> SHA-256 hashes detect document mismatch; they do not authenticate who created a bundle. Use a separate signature or MAC when bundles cross an untrusted boundary.

## The pipeline

![JSON values go through admission, an engine adapter, a v1 hash-guarded bundle, then apply on a clone.](/blog/jsondiffnext-pipeline.svg)

The public API does not change when you switch engines. `diff()` always returns the same shape.

```ts
export interface HashPatchBundle extends PatchDirections {
  readonly version: 1;
  readonly algorithm: HashAlgorithm;
  readonly baseHash: string;
  readonly resultHash: string;
  readonly metadata?: PatchBundleMetadata;
}
```

That type lives in [`core.ts`](https://github.com/2tsoftwareapp/jsondiffnext/blob/56455bf/core.ts). `diff()` never returns a raw RFC 6902 array.

## Canonical JSON, then SHA-256

The pin is not `JSON.stringify`. Integer-looking keys would come back in numeric order. [`canonicalHash`](https://github.com/2tsoftwareapp/jsondiffnext/blob/56455bf/core.ts) walks the value, sorts object keys as UTF-16 code units, keeps array order, and hashes the UTF-8 bytes.

```ts
export function canonicalHash(value: JsonValue): string {
  scanJson(value, APPLY_MAX_WORK, HARD_MAX_DEPTH);
  const chunks: string[] = [];
  function string(v: string): string {
    if (/[\uD800-\uDFFF]/u.test(v)) throw new SpikeError('InvalidJson', 'Lone Unicode surrogate is not valid canonical JSON');
    return JSON.stringify(v);
  }
  function emit(v: JsonValue): void {
    if (typeof v === 'string') { chunks.push(string(v)); return; }
    if (v === null || typeof v !== 'object') { chunks.push(JSON.stringify(v)); return; }
    const array = Array.isArray(v);
    chunks.push(array ? '[' : '{');
    const keys = array ? Object.keys(v) : Object.keys(v).sort();
    for (let i = 0; i < keys.length; i++) {
      if (i) chunks.push(',');
      const key = keys[i]!;
      if (!array) chunks.push(string(key), ':');
      emit((v as Record<string, JsonValue>)[key]!);
    }
    chunks.push(array ? ']' : '}');
  }
  emit(value);
  return createHash('sha256').update(chunks.join(''), 'utf8').digest('hex');
}
```

Lone surrogates fail. Cycles, getters, `undefined`, and bigint fail earlier in `scanJson`. The hash is 64 lowercase hex characters. Two documents that serialize the same way under RFC 8785 share a pin.

## Apply never mutates the caller's object

[`adapters.ts`](https://github.com/2tsoftwareapp/jsondiffnext/blob/56455bf/adapters.ts) hashes the document first. On mismatch it throws `PreconditionFailed: Base document hash mismatch` before any operation runs. Then it clones.

```ts
if (hashed && options.verifyBase) {
  const expected = reverse ? patch.resultHash : patch.baseHash;
  if (meter.span('hash', () => canonicalHash(document)) !== expected) {
    throw new SpikeError('PreconditionFailed', 'Base document hash mismatch');
  }
}
const envelope = meter.span('clone', () => ({ value: canonicalClone(document) }));
```

Ops run on `envelope.value`. When they finish, the staging hash has to match `resultHash` (or `baseHash` on revert). Failure throws `Result document hash mismatch` and the clone is dropped. The object the caller passed in is still the object the caller passed in.

```ts
if (hashed) {
  const expected = reverse ? patch.baseHash : patch.resultHash;
  if (meter.span('hash', () => canonicalHash(envelope.value)) !== expected) {
    throw new SpikeError('PreconditionFailed', 'Result document hash mismatch');
  }
}
const result = meter.span('clone', () => canonicalClone(envelope.value));
return hashed ? meter.span('freeze', () => deepFreeze(result)) : result;
```

`verifyBase: false` skips the first check. It does not skip the result check.

## Three engines, one fallback

[`1f7d1c4`](https://github.com/2tsoftwareapp/jsondiffnext/commit/1f7d1c4) wired the adapters. Each library generates and applies inside an envelope `{ value }`, so a root replacement is a write of `envelope.value`, not a fight with each library's root-document rules.

```ts
'fast-json-patch': {
  generate(before, after) { return stripEnvelope(fast.compare({ value: before }, { value: after }, true)); },
  apply(envelope, operation) { fast.applyPatch(envelope, [operation], true, true, true); },
},
rfc6902: {
  generate(before, after) { return stripEnvelope(rfc.createPatch({ value: before }, { value: after })); },
  apply(envelope, operation) {
    const errors = rfc.applyPatch(envelope, [operation]);
    const error = errors.find(e => e !== null);
    if (error) throw error;
  },
},
```

Admission is a score, not a wall-clock deadline. Default work is 20 million units, hard depth 256. When the score plus scan work exceeds the budget, or when a backend hits a key it cannot handle, the wrapper does not let the native generator run unbounded. It emits a hashed root replace.

```ts
forward = [{ op: 'replace', path: '', value: right! }];
inverse = [{ op: 'replace', path: '', value: left! }];
```

The bundle is still version 1. The hashes still have to match. The patch is larger. That is the trade.

## What the numbers are, and are not

One exploratory run on Node v24.21.0, Intel i5-10400, 19 fixture cells × 21 samples × 3 adapters. All 57 cells passed the harness. End-to-end here means diff, stringify, parse, apply, revert, with the wrapper checks on.

| Adapter | Median of 19 cell E2E p50s | Median hash/E2E | Median worker peak RSS |
| --- | ---: | ---: | ---: |
| `fast-json-patch` | 60.39 ms | 15.44% | 166.3 MiB |
| `jsondiffpatch` | 28.84 ms | 22.46% | 123.1 MiB |
| `rfc6902` | 19.89 ms | 38.36% | 120.4 MiB |

Hashing is a material part of the time. The table is not a ranking of the three libraries as raw engines. Different adapters take different fallbacks and emit different patch sizes. At 20,000 array elements every measured cell used `native-admission-root-replace`. [`bfe5889`](https://github.com/2tsoftwareapp/jsondiffnext/commit/bfe5889) is the commit that stopped the README from implying otherwise.

The usage that the package actually exports:

```ts
import { diff, applyPatch, revertPatch } from 'jsondiffnext';

const bundle = diff(before, after);
const updated = applyPatch(before, bundle);
const restored = revertPatch(updated, bundle);
```

If you need a hot path without the clone and the hash, use an engine directly. This package is the pin.

## References

- Repository: [2tsoftwareapp/jsondiffnext](https://github.com/2tsoftwareapp/jsondiffnext)
- Wrapper: [`1f7d1c4`](https://github.com/2tsoftwareapp/jsondiffnext/commit/1f7d1c4)
- Hash guards: [`2812694`](https://github.com/2tsoftwareapp/jsondiffnext/commit/2812694)
- Honest numbers: [`bfe5889`](https://github.com/2tsoftwareapp/jsondiffnext/commit/bfe5889)
- Files: [`core.ts`](https://github.com/2tsoftwareapp/jsondiffnext/blob/56455bf/core.ts), [`adapters.ts`](https://github.com/2tsoftwareapp/jsondiffnext/blob/56455bf/adapters.ts)
