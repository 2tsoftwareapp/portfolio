# Documentation index

This folder holds **operational** and **architecture** docs for the portfolio. Start here for domain migration, repo hygiene, and **feature-level** diagrams (PlantUML) with short markdown companions.

**Viewing diagrams:** GitHub and most Markdown viewers do **not** render `.puml` files. Each feature page embeds a **pre-rendered SVG** next to the `.puml` source. After editing a `.puml`, run `bun run docs:diagrams` (requires [PlantUML](https://plantuml.com/) locally, e.g. `brew install plantuml`) to refresh the SVGs.

## Feature architecture

Each item links to a companion markdown file; under `docs/features/` you also have `.puml` sources and matching `.svg` previews.

- [Content collections](./features/content-collections.md) — blog, journal, courses via Astro Content Collections
- [Page shell & command palette](./features/page-shell-navigation.md) — `BaseLayout`, `CommandPalette`
- [Public API routes](./features/public-api-routes.md) — grouped `src/pages/api` map
- [Contact / Telegram](./features/contact-telegram.md) — `POST /api/contact`
- [Payments & certificates](./features/payments-certificates.md) — Stripe, certificates, crypto stubs

## Operations & migration

- [DOMAIN_MIGRATION.md](./DOMAIN_MIGRATION.md) — Canonical domain (`truongsoftware.com`), nginx/DNS checklist
- [REPO_HYGIENE.md](./REPO_HYGIENE.md) — Ignored paths, dependency notes, disabled routes
- [UI_STYLES.md](./UI_STYLES.md) — Comparison & branch reference for the 3 portfolio UI themes (`Style 1` active on `main`)
