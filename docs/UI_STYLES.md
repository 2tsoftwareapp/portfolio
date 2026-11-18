# Portfolio UI Styles & Theme Branches

This document records the three distinct UI design directions created for the portfolio, their dedicated Git branches on `origin`, and how to switch, preview, or deploy each theme.

## Active Production Style

- **Active on `main`:** **Style 1 — Swiss Industrial / Precision Hardware** (merged from `style/1-swiss-industrial` at `92f3cf1`)
- **Production Domain:** `https://truongsoftware.com` (Cloudflare Workers via `wrangler.json`)

---

## Branch Matrix

| Style | Branch | Remote | Commit | Core Aesthetic |
| :--- | :--- | :--- | :--- | :--- |
| **Style 1 (Active)** | `style/1-swiss-industrial` | `origin/style/1-swiss-industrial` | `92f3cf1` | Warm Matte Carbon, International Signal Orange (`#FF4F00`), `Space Grotesk`, `0px` corners, exposed `1px` hairline grids |
| **Style 2** | `style/2-neo-editorial` | `origin/style/2-neo-editorial` | `366cd9b` | Forest-Obsidian Ink, Warm Parchment, Editorial Vermilion (`#E54324`), `Newsreader` serif, 12-column sticky chapter split |
| **Style 3** | `style/3-terminal-native` | `origin/style/3-terminal-native` | `d594c71` | CRT Deep Void, Phosphor Emerald (`#06DF72`), `JetBrains Mono` throughout, Tmux bars, `btop`/TUI process windows |

*(All three branches started from baseline commit `281e1eb` on `main`.)*

---

## Detailed Breakdown of Each Style

### 1. Style 1: Swiss Industrial / Precision Hardware (`style/1-swiss-industrial`)
- **Inspiration:** Teenage Engineering, Linear, Braun industrial hardware spec sheets.
- **Color Tokens (`src/styles/global.css`):**
  - `--background`: `30 6% 6%` (Warm Matte Carbon)
  - `--card`: `30 5% 8.5%` (Machined Panel)
  - `--foreground`: `40 15% 94%` (Anodized Off-White)
  - `--primary` / `--ring`: `19 100% 50%` (International Signal Orange `#FF4F00`)
  - `--radius`: `0rem` (strict sharp corners across cards, badges, inputs, and buttons)
- **Typography (`src/layouts/BaseLayout.astro`):** `Space Grotesk` for headings, `Inter` for body copy, `JetBrains Mono` for specs, tags, and indices.
- **Layout & Signature Components:**
  - Static 2-tier blueprint grid (`24px` minor + `120px` major lines) in `GridBackground.astro` (removed infinite scroll animation).
  - `[SYS.01]` hardware indicator and indexed `01`..`07` nav links in `Navigation.tsx`.
  - Hero metadata strip (`DOC.REF // DQT-PORTFOLIO`), `SPEC.00` badge, hairline 2×2 `focusAreas`, and `Telemetry Spec` panel (`M.01`..`M.04`).
  - Left-aligned indexed section headers (`[01 // CAPABILITIES]` through `[07 // TRANSMISSION]`) with joined hairline grids (`gap-0 border-t border-l border-border`) for Skills, Certifications, GitHub Telemetry (`#ff4f00` chart), and Testimonials.

### 2. Style 2: Neo-Editorial Monograph (`style/2-neo-editorial`)
- **Inspiration:** Stripe Press, Read.cv, Monocle, architectural monographs.
- **Color Tokens (`src/styles/global.css`):**
  - `--background`: `150 12% 5.5%` (Deep Forest-Obsidian Ink)
  - `--card`: `150 10% 8%` (Warm Folio Surface)
  - `--foreground`: `38 28% 92%` (Warm Parchment)
  - `--primary` / `--ring`: `11 80% 52%` (Editorial Vermilion `#E54324`)
  - `--radius`: `0.125rem`
- **Typography (`src/layouts/BaseLayout.astro`):** High-contrast serif `Newsreader` (regular + italic) for `h1`, `h2`, chapter rubrics, and pull quotes, paired with `Inter` and `JetBrains Mono`.
- **Layout & Signature Components:**
  - Vertical 12-column folio column guidelines in `GridBackground.astro`.
  - Masthead navigation (`Vol. VI — Monograph`) with Roman numeral link prefixes (`I.`..`VII.`).
  - Asymmetric 12-column split across all chapters (`lg:col-span-4` sticky chapter rubric + `lg:col-span-8` flowing monograph content) from `Chapter I — Capabilities` through `Chapter VII — Correspondence`.
  - Classic ledger underline inputs in `ContactForm.client.tsx`, 2-column numbered `Selected Works` (`No. 01`..`No. 12`), Vermilion GitHub chart (`e54324`), and book colophon footer.

### 3. Style 3: Terminal-Native / Oxide Systems (`style/3-terminal-native`)
- **Inspiration:** Oxide Computer, Warp, Raycast, Neovim/Tmux TUI environments.
- **Color Tokens (`src/styles/global.css`):**
  - `--background`: `215 35% 4.5%` (CRT Deep Void)
  - `--card`: `215 30% 6.5%` (TUI Pane Surface)
  - `--foreground`: `160 25% 92%` (Phosphor-Tinted White)
  - `--primary` / `--ring`: `152 95% 45%` (Phosphor Emerald `#06DF72`)
  - `--radius`: `0rem`
- **Typography:** Monospace-first (`JetBrains Mono` for `html` and all headings `h1`–`h6`).
- **Layout & Signature Components:**
  - Static phosphor dot-matrix (`20px × 20px`) + subtle CRT scanlines in `GridBackground.astro`.
  - Top Tmux bar (`NORMAL ~/truong.dev`, `[1:Experience]`..`[7:Contact]`) and bottom `TMUX` status bar footer.
  - Shell prompt Hero (`truongdq@oxide-node:~/portfolio$ ./inspect --profile --live`), `[OK]` capability flags, `[⏎]` CTA, `btop` telemetry window (`● ONLINE` + ASCII bars), and `zsh ❯ role --current` bar.
  - CLI command headers per section (`lscpu`, `git log`, `gpg`, `gh api`, `tail`, `systemctl`, `./send-message`), `[unit:*]` project windows, `[stdin // message_buffer]` contact pane, and `#06df72` GitHub chart.

---

## Workflow Commands (`bun`)

Preview any style locally:

```bash
git checkout style/2-neo-editorial   # or style/1-swiss-industrial, style/3-terminal-native
bun run dev
```

Verify and build before deployment:

```bash
bun run lint && bun run check && bun run build
```

Deploy the built bundle to Cloudflare Workers (`truongsoftware.com`):

```bash
bun x wrangler deploy --config dist/server/wrangler.json
```

Switch production (`main`) to another style branch in the future:

```bash
git checkout main
git reset --hard origin/style/2-neo-editorial   # or merge onto main
git push origin main
```
