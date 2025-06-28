# solberg.is

A blog built with Next.js 15. Forked from [shuding/shud.in](https://github.com/shuding/shud.in) with the layout and design foundation preserved, while adding a Monaco based Markdown editor.

The key technical innovation is server-side syntax highlighting using Shiki, which processes code highlighting at build time rather than in the browser, resulting in zero JavaScript overhead for syntax highlighting while maintaining full visual fidelity.

## Features

- **Server-side syntax highlighting** - Shiki processes code highlighting in React Server Components, eliminating client-side JavaScript for code blocks
- **Monaco-based markdown editor** - Full-featured web editor with live preview and syntax highlighting
- **Turso database** - Edge-optimized LibSQL database with Drizzle ORM
- **Biome 2.0 tooling** - Fast linting and formatting with type-aware analysis
- **Tailwind CSS v4** - Latest CSS framework with improved performance
- **MDX support** - Markdown with embedded React components

## Tech Stack

- **Framework:** Next.js 15 with React Server Components
- **Database:** Turso (LibSQL) with Drizzle ORM
- **Styling:** Tailwind CSS v4
- **Content:** MDX with server-side Shiki syntax highlighting
- **Tooling:** Biome 2.0, TypeScript, Bun
- **Editor:** Monaco Editor for markdown editing

## Getting Started

```bash
# Install dependencies
bun install

# Set up database
bun run generate:migration
bun run run:migration

# Start development server
bun dev

# Run Turso locally
turso dev --db-file database.db --port 9797
```

## Content Management

The blog uses a clean URL structure for content management:

- `/` - Post index
- `/{slug}` - Published post view
- `/{slug}/editor` - Create new post or edit existing post

The editor features:

- Monaco Editor for markdown editing with syntax highlighting
- Live preview with real-time rendering
- Draft and publish state management
- Server-side processing of MDX

---

Live site: [https://www.solberg.is](https://www.solberg.is)
