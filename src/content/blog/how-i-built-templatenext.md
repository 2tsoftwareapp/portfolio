---
title: "templatenext does not compile templates to JavaScript"
date: "2026-11-11"
description: "A restricted template language, verified bytecode, and a bounded Rust VM. Helpers stay on the JS thread. EJS and doT still win on speed; this engine wins on what template source is allowed to mean."
slug: "how-i-built-templatenext"
published: true
tags: ["Rust", "TypeScript", "Open Source"]
author: "Dao Quang Truong"
coverImage: "https://images.unsplash.com/photo-1607799279861-4dd421510fb2?auto=format&fit=crop&q=80&w=1000"
---

EJS and doT turn a template into a JavaScript function and run it. That is fast. It is also "whatever this string evaluates to." [templatenext](https://github.com/2tsoftwareapp/templatenext) takes the other side: a closed expression language, compiled to bytecode, checked, then executed by a Rust VM with fuel. The GitHub history is one commit, [`c5f875a`](https://github.com/2tsoftwareapp/templatenext/commit/c5f875a). The mechanism is the compile pipeline.

> Template source cannot call arbitrary JavaScript, access the filesystem, or make network requests. Helpers and filters are application-provided JavaScript callbacks; only register capabilities you trust.

## Host, snapshot, VM

![Node API, N-API snapshot, lexer/parser, bytecode plus verifier, bounded Rust VM. Helpers stay on the JS thread.](/blog/templatenext-vm.svg)

JavaScript still owns the public API. [`createTemplate`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/packages/templatenext/lib/index.cjs) is a constructor wrapper. Compile crosses N-API with a snapshot of own data descriptors, not live Proxies.

```js
function safeHtml(value) {
  try { return adapter.safeHtml(value); }
  catch (error) { throw new TemplateError(error.code, error.message); }
}
function createTemplate(options) { return new Template(options); }
```

On the Rust side the steps are linear. [`compile_program`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-node/src/lib.rs) is the whole frontend.

```rust
fn compile_program(text: &str, limits: CompilationLimits) -> Result<Program, CompileError> {
    let source = Source::with_limits(text, limits.source)?;
    let ast = Parser::new(&source).parse()?;
    let hir = hir::lower(&ast)?;
    bytecode::validate_string_limits(&hir, limits.bytecode.max_string_bytes)?;
    bytecode::compile_with_limits(&optimizer::optimize(hir), limits.bytecode)
}
```

There is no JS eval in that list.

## Verify before the first instruction

[`compile_with_limits`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/bytecode.rs) clamps caller limits to implementation ceilings (`MAX_INSTRUCTIONS = 131_072`, eight megabytes of bytecode) and does not return a `Program` until the verifier says the jumps and the stack are legal.

```rust
pub fn compile_with_limits(hir: &Hir, limits: BytecodeLimits) -> Result<Program, CompileError> {
    // Caller-supplied limits can never bypass core implementation ceilings.
    let limits = BytecodeLimits {
        max_bytecode_bytes: limits.max_bytecode_bytes.min(MAX_BYTECODE_BYTES),
        max_instructions: limits.max_instructions.min(MAX_INSTRUCTIONS),
        max_stack_slots: limits.max_stack_slots.min(crate::verifier::MAX_STACK),
        max_string_bytes: limits.max_string_bytes.min(MAX_POOL_STRING_BYTES),
    };
    let mut compiler = Compiler {
        code: Vec::new(),
        constants: Vec::new(),
        names: Vec::new(),
        name_ids: HashMap::new(),
        pool_string_bytes: 0,
        expression_start: None,
        local_slots: hir.local_slots,
        limits,
        charged_bytes: std::mem::size_of::<Program>(),
    };
    compiler.check_bytes(compiler.charged_bytes, hir.span)?;
    compiler.compile_nodes(&hir.nodes)?;
    compiler.emit(InstructionKind::Halt, hir.span)?;
    let mut program = Program {
        code: compiler.code,
        constants: compiler.constants,
        names: compiler.names,
        local_slots: compiler.local_slots,
        max_stack: 0,
        span: hir.span,
    };
    program.max_stack = crate::verifier::verify_with_stack_limit(&program, limits.max_stack_slots)?;
    debug_assert_eq!(program.estimated_bytes(), compiler.charged_bytes);
    Ok(program)
}
```

[`verifier.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/verifier.rs) rejects an empty program, an oversized instruction list, bad constant pools, and branch targets that leave their region. Stack height is capped at 8,192.

```rust
pub fn verify_with_stack_limit(program: &Program, max_stack: u32) -> Result<u32, CompileError> {
    let code_len = program.code.len();
    if code_len == 0 {
        return Err(invalid(program.span, "bytecode program is empty"));
    }
    if code_len > MAX_INSTRUCTIONS {
        return Err(CompileError::limit(
            program.span,
            "bytecode instruction limit exceeded",
        ));
    }
    validate_spans(program)?;
    validate_pools(program)?;
    let memberships = validate_instructions(program)?;
    validate_branch_regions(program, &memberships)?;
    verify_stack(program, max_stack.min(MAX_STACK))
}
```

## Fuel is an instruction counter

The VM loop in [`render.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/render.rs) asserts the program already verified, then charges one unit of fuel per instruction. Default fuel is 1,000,000. Default loop items 10,000. Default output 16 MiB.

```rust
fn execute(session: &mut Session<'_>, program: &Program, root: &Value) -> Result<(), CompileError> {
    debug_assert!(
        verifier::verify(program).is_ok(),
        "bytecode must already be verified at compile time"
    );
    let mut stack: Vec<Value> = Vec::new();
    let mut locals = vec![Value::undefined(); program.local_slots() as usize];
    let mut frames: Vec<LoopFrame> = Vec::new();
    let mut pc: usize = 0;
    loop {
        let Some(instruction) = program.instructions().get(pc) else {
            return Err(CompileError::runtime(
                Span::new(0, 0),
                "execution reached past the end of the program",
            ));
        };
        let span = instruction.span();
        charge_fuel(session, pc, span)?;
        match instruction.kind() {
```

```rust
fn charge_fuel(session: &mut Session<'_>, pc: usize, span: Span) -> Result<(), CompileError> {
    if session.fuel == 0 {
        return Err(CompileError::limit(
            span,
            format!("vm fuel exhausted near instruction {pc}"),
        ));
    }
    session.fuel -= 1;
    Ok(())
}
```

Fuel does not interrupt a JavaScript helper that blocks. The README says that. The VM is a bound on template bytecode, not a sandbox around the callbacks you registered.

## Escaping is the default; raw is a brand

Ordinary interpolation always goes through `EscapeHtml`. [`ops.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/ops.rs) is the usual five replacements.

```rust
pub fn escape_html(input: &str) -> String {
    let mut escaped = String::with_capacity(input.len());
    for character in input.chars() {
        match character {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            '"' => escaped.push_str("&quot;"),
            '\'' => escaped.push_str("&#39;"),
            _ => escaped.push(character),
        }
    }
    escaped
}
```

[`emit_escaped`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/output.rs) escapes `SafeHtml` too. Raw output is a different opcode, and it refuses anything that is not branded.

```rust
pub fn emit_raw(&mut self, value: &Value, span: Span) -> Result<(), CompileError> {
    let ValueKind::SafeHtml(safe) = value.kind() else {
        return Err(runtime(span, "raw output requires a SafeHtml value"));
    };
    self.append(safe.payload(), span)
}
```

HTML escaping is not URL validation. It is not a CSS or JavaScript context. The engine will happily escape a string you then drop into `href`. That is still your problem.

## Speed is mixed, on purpose

One host, Linux x64, Intel i5-10400, Node v24.21.0. TemplateNext 0.1.0 against EJS 7.0.2, Eta 4.6.0, doT 1.1.3, Handlebars 4.7.10, Nunjucks 3.2.4. Warm-render p50 batch mean, microseconds per op.

| Workload | TemplateNext | Fastest other | Ratio |
| --- | ---: | --- | ---: |
| 80% HTML-escaping string | 80.85 | EJS 252.27 | 0.32× (led) |
| 20 interpolations | 76.82 | Eta 9.20 | 8.4× slower |
| Catalog page + partials | 332.47 | doT 10.83 | 30.7× slower |
| 1,000-item loop | 1,407.16 | doT 253.01 | 5.6× slower |
| Identity helper × 20 | 104.65 | doT 5.39 | 19.4× slower |

It led only when most of the work was escaping. A compiled JavaScript function that returns a constant string will beat a VM. The product claim is the language, not the leaderboard.

The native addon is Linux x64 glibc. Node 22, 24, and 26 were checked locally. Bun, Deno, WASM, and other OS/arch combinations are out of this MVP. The package is not on npm yet.

```js
const { createTemplate } = require('@templatenext/core');

const engine = createTemplate();
engine.registerPartial('row', engine.compile('<li>{{= it}}</li>'));
const page = engine.compile(
  '<h1>{{= it.title}}</h1><ul>{{each it.items as item}}{{include "row" with item}}{{/each}}</ul>',
);
page.render({ title: 'Updates', items: ['One', 'Two'] });
```

If the template author is also the application author, EJS is simpler. If the template author is a tenant, the VM is the point.

## References

- Repository: [2tsoftwareapp/templatenext](https://github.com/2tsoftwareapp/templatenext) (private)
- Curated tree: [`c5f875a`](https://github.com/2tsoftwareapp/templatenext/commit/c5f875a)
- Files: [`lib.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-node/src/lib.rs), [`bytecode.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/bytecode.rs), [`verifier.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/verifier.rs), [`render.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/render.rs), [`output.rs`](https://github.com/2tsoftwareapp/templatenext/blob/c5f875a/crates/templatenext-core/src/output.rs)
