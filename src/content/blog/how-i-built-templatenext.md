---
title: "templatenext compiles templates to JavaScript and never trusts the template"
date: "2026-11-11"
description: "Version 0.2.0 deleted the Rust VM. Template source is parsed into a closed grammar, and code generation emits only JSON literals and parser-owned identifiers — so nothing written in a template becomes code."
slug: "how-i-built-templatenext"
published: true
tags: ["JavaScript", "Node.js", "Open Source"]
author: "Dao Quang Truong"
coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421510fb2?auto=format&fit=crop&q=80&w=1000"
---

The first version of [templatenext](https://github.com/2tsoftwareapp/templatenext) compiled templates to bytecode and ran them in a Rust VM behind an N-API addon. It worked, and I deleted it. Version 0.2.0 compiles to a JavaScript function instead. The interesting part is not that it compiles to JavaScript — EJS and doT do that. It is what the compiler is allowed to emit.

> Body is only JSON.stringify'd literals and parser-owned identifiers — never raw template text.

That comment sits above the `new Function` call in [`engine.cjs`](https://github.com/2tsoftwareapp/templatenext/blob/590da55/packages/templatenext/lib/engine.cjs). The commit is [`62ba3cc`](https://github.com/2tsoftwareapp/templatenext/commit/62ba3cc).

## Why the VM went away

The CHANGELOG is blunt about it. The native escape addon only won on strings denser than roughly 10% special characters, and made realistic renders 1.7–4x slower. Once escaping was pure JavaScript, the VM was buying a language boundary at the cost of a native build, a per-platform binary, and a snapshot transport across N-API. The boundary is real, but it does not need a second runtime.

The replacement keeps the property that mattered: template text never reaches the generated function body as code.

![Template source is parsed into a closed grammar. Code generation emits only JSON literals and parser-owned identifiers. Render is a function call; helpers are pinned to slots.](/blog/templatenext-compile.svg)

## The compiler emits three things

Text nodes become `JSON.stringify` of the literal. Interpolations become a call to the runtime escape function. That is the whole of the text path in [`engine.cjs`](https://github.com/2tsoftwareapp/templatenext/blob/590da55/packages/templatenext/lib/engine.cjs).

```js
function compileBody(nodes, locals, strict, scopeNullable, plan) {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') {
      if (node.value) out += `s+=${JSON.stringify(node.value)};`;
      continue;
    }
    if (node.type === 'esc') {
      out += `s+=$.e(${compileExpr(node.expr, locals, strict, scopeNullable, plan)});`;
      continue;
    }
    if (node.type === 'raw') {
      out += `s+=$.raw(${compileExpr(node.expr, locals, strict, scopeNullable, plan)});`;
      continue;
    }
```

Expressions follow the same discipline. A literal goes through `litCode`, which is `JSON.stringify` plus two special cases.

```js
function litCode(value) {
  if (value === undefined) return 'void 0';
  if (typeof value === 'number' && Object.is(value, -0)) return '0';
  return JSON.stringify(value);
}
```

A property read is either a dot access on an identifier the compiler matched against `/^[A-Za-z_][A-Za-z0-9_]*$/`, or a bracket access on a JSON-quoted string. Neither path can carry a `(` or a `;` from template text into the output.

```js
function compileGet(objCode, keyNode, locals, strict, objNullable) {
  if (!strict && keyNode.type === 'lit' && typeof keyNode.value === 'string') {
    const k = JSON.stringify(keyNode.value);
    const ident = /^[A-Za-z_][A-Za-z0-9_]*$/.test(keyNode.value);
    const read = ident ? `${objCode}.${keyNode.value}` : `${objCode}[${k}]`;
    if (objNullable) return `(${objCode}!=null?${read}:void 0)`;
    return read;
  }
  return `$.g(${objCode},${compileExpr(keyNode, locals, strict, scopeNullable, true)})`;
}
```

The function body is assembled from those two primitives and a fixed prologue.

```js
function generate(source, opts, limits) {
  if (typeof source !== 'string') fail('ERR_TEMPLATE_TYPE', 'source must be a string');
  if (Buffer.byteLength(source) > limits.maxSourceBytes) {
    fail('ERR_TEMPLATE_LIMIT', 'maxSourceBytes exceeded');
  }
  const file = opts.name || '<anonymous>';
  const ast = parse(source, (code, message, at) => syntax(code, message, at, file));
  if (countNesting(ast) > limits.maxNestingDepth) fail('ERR_TEMPLATE_LIMIT', 'maxNestingDepth exceeded');
  const plan = newPlan();
  const body = compileBody(ast, new Set(), opts.strict, false, plan);
  const code = `"use strict";let s="";const $root=ctx;let $s=ctx;let $tmp;let $r;${body}return s;`;
  return { code, plan };
}
```

`new Function` is still code generation, and the engine says so rather than hiding it. The parse happens first, the limits are checked before generation, and a runtime that blocks `new Function` gets a named error pointing at `precompile()`.

```js
function compileSource(engine, source, options) {
  const opts = readOptions(options);
  const limits = opts.limits || { ...DEFAULT_LIMITS };
  const { code, plan } = generate(source, opts, limits);
  let fn;
  try {
    // Body is only JSON.stringify'd literals and parser-owned identifiers — never raw template text.
    fn = new Function('ctx', '$', '$h', '$f', code);
  } catch (error) {
    fail('ERR_TEMPLATE_SYNTAX', 'code generation is unavailable in this runtime (eval is blocked?); use precompile() at build time and load() at runtime', { cause: error });
  }
  return new CompiledTemplate(engine, source, opts.name, fn, limits, opts.strict, plan);
}
```

If you want no `new Function` at runtime at all, `precompile()` returns a module expression at build time and `load()` wraps it without generating anything.

```js
  precompile(source, options) {
    const opts = readOptions(options);
    const limits = opts.limits ? { ...this._limits, ...opts.limits } : this._limits;
    const strict = opts.strict === true || this._strict;
    const { code, plan } = generate(source, { ...opts, limits, strict }, limits);
    return `{v:1,name:${JSON.stringify(opts.name ?? null)},helpers:${JSON.stringify(plan.helperNames)},` +
      `filters:${JSON.stringify(plan.filterNames)},strict:${strict},` +
      `fn:function(ctx,$,$h,$f){${code}}}`;
  }
```

The output is JavaScript, so load only artifacts you generated. That is the same trust boundary as a build artifact, not a new one.

## Escaping is the default and raw output is a brand

`{{value}}` escapes. `{{! value}}` emits raw only for a value made by `safeHtml()`. The brand is `WeakSet` membership, not a property on the object, so a caller cannot forge it by setting `__html`.

```js
function safeHtml(html) {
  if (typeof html !== 'string') fail('ERR_TEMPLATE_TYPE', 'safeHtml() requires a string');
  const box = Object.freeze(Object.create(null));
  SAFE.add(box);
  SAFE_HTML.set(box, html);
  return box;
}

function unwrapSafe(value) {
  return SAFE.has(value) ? SAFE_HTML.get(value) : null;
}
```

Escaping has two paths. Fields up to 80 code units go through a hand-written loop; longer strings take a regex `replace`. The loop captures `String.prototype.charCodeAt` and `slice` at module load and calls them with `.call`.

```js
const SHORT_ESCAPE = 80;

// charCodeAt/slice are captured once and invoked via .call: code that runs
// Object.create(String.prototype) (Nunjucks runtime) turns String.prototype into a
// dictionary-mode object, after which `text.charCodeAt(i)` loses inlining (~3x slower).
// Measured with that trigger present: method call 270 ns vs captured .call 90 ns per field.
const charCodeAt = String.prototype.charCodeAt;
const sliceStr = String.prototype.slice;

function escapeShort(text) {
  let out = '';
  let last = 0;
  for (let i = 0; i < text.length; i++) {
    let r;
    switch (charCodeAt.call(text, i)) {
      case 38: r = '&amp;'; break;
      case 60: r = '&lt;'; break;
      case 62: r = '&gt;'; break;
      case 34: r = '&quot;'; break;
      case 39: r = '&#39;'; break;
      default: continue;
    }
    if (last !== i) out += sliceStr.call(text, last, i);
    out += r;
    last = i + 1;
  }
  if (last === 0) return text;
  return last === text.length ? out : out + sliceStr.call(text, last);
}
```

That comment is the whole reason the loop exists in this shape. A benchmark harness that loads Nunjucks in the same process turns `String.prototype` into a dictionary-mode object, and the ordinary method call loses its inline cache. Capturing the function once survives it.

## Helpers are slots, not lookups

A helper name is resolved at compile time into an index in an array. The call site is a direct array read plus an inlined counter, and the label is only set while the call runs so the outer `try` can still name what threw.

```js
// A helper/filter call compiles to a direct slot call plus an inlined call counter.
// `$.hn` carries the label only while the call runs, so the outer try/catch in
// render() can still attribute a throw without a per-call try/catch.
function callCode(arrayName, slot, label, args) {
  return `(++$.hc>$.mh&&$.lim(),$.hn=${JSON.stringify(label)},$r=${arrayName}[${slot}](${args.join(',')}),$.hn=null,$r)`;
}
```

The array is rebuilt when the registry changes, so registering a helper after compiling does not leave a stale slot.

## What the numbers say

One run, Node v24.21.0, Linux x64, Intel i5-10400. templatenext 0.2.0 against EJS 7.0.2, Eta 4.6.0, doT 1.1.3, Handlebars 4.7.10, Nunjucks 3.2.4. The run first required byte-exact output (84 assertions), then measured 378 isolated process cells and 3,402 batch samples, each engine in its own process. Warm-render p50 batch mean, µs per op.

| Workload | templatenext | doT | Eta | EJS | Handlebars | Nunjucks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 20 interpolations | **2.74** | 8.87 | 10.00 | 18.97 | 11.41 | 10.52 |
| 1,000-item loop | **97.9** | 272 | 344 | 569 | 320 | 1094 |
| Catalog page + partials | **5.87** | 10.92 | 13.64 | 40.44 | 29.12 | 52.76 |
| Identity helper × 20 | **1.54** | 5.05 | 6.09 | 12.01 | 8.99 | 6.90 |
| 80% HTML-escaping string | 267 | 291 | 272 | **260** | 270 | 301 |

templatenext was fastest on five of seven fixtures. On the escaping-heavy fixture it sits with the pack at 1.02× of the fastest, because long strings full of markup go through the regex path and the short-string loop stops helping once most characters need replacing. On the static-page fixture doT and Eta return a constant string, so that row is not a ranking.

Batch rendering is where the shape of the API shows up. 10,000 invoices of 730 B rendered at 8.5–12.7 µs per document. Writing them one `writeFileSync` at a time cost 22.5 µs per file; through the default 64-way pool, 14.8 µs. Writing files, not rendering, is the bulk of a batch job.

The suite reported 80 passing tests across nine files, including a real-output suite that compares bytes against an independent oracle and checks document structure with `parse5`. It passed on Node 26.12.1, 24.22.1, and 24.5.0. Bun, Deno, and WASM are not verified, and neither are live Workers or Vercel Edge runtimes — the organisation's Actions billing has blocked CI runs, so the workflow exists but has not executed remotely.

```js
const { createTemplate } = require('@templatenext/core');

const engine = createTemplate();
engine.registerPartial('row', engine.compile('<li>{{name}}</li>'));
const page = engine.compile('<h1>{{title}}</h1><ul>{{#items}}{{>row}}{{/}}</ul>');

page.render({ title: 'Updates', items: [{ name: 'One' }, { name: 'Two' }] });
// <h1>Updates</h1><ul><li>One</li><li>Two</li></ul>
```

The package is not on npm. It ships CommonJS, ESM, and TypeScript declarations as plain files with no build step and no runtime dependencies.

## What this is not

It is not a sandbox. Helpers and filters are application callbacks, and render limits do not interrupt a callback that runs too long. HTML escaping is for HTML text output; it does not validate a URL or make a value safe inside a script or a style attribute.

If the template author is also the application author, EJS is simpler and has more users. The reason to pick this one is that template text stays data at every step of the pipeline, and that property survives a tenant editing the template.

## References

- Repository: [2tsoftwareapp/templatenext](https://github.com/2tsoftwareapp/templatenext) (private)
- 0.2.0 rewrite: [`62ba3cc`](https://github.com/2tsoftwareapp/templatenext/commit/62ba3cc)
- v0.1 leftovers removed: [`68e993f`](https://github.com/2tsoftwareapp/templatenext/commit/68e993f)
- Changelog and license: [`b65e014`](https://github.com/2tsoftwareapp/templatenext/commit/b65e014)
- README restructure: [`590da55`](https://github.com/2tsoftwareapp/templatenext/commit/590da55)
- Files: [`engine.cjs`](https://github.com/2tsoftwareapp/templatenext/blob/590da55/packages/templatenext/lib/engine.cjs), [`parse.cjs`](https://github.com/2tsoftwareapp/templatenext/blob/590da55/packages/templatenext/lib/parse.cjs)
