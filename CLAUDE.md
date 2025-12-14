# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server:** `bun dev` (uses Next.js 15 with Turbo mode)
- **Build:** `bun run build`
- **Linting and formatting:** `bun run format-and-lint` (check only) or `bun run format-and-lint:fix` (fix issues)
- **Database migrations:** `bun run generate:migration` (generate) and `bun run run:migration` (apply)
- **Local database:** `turso dev --db-file database.db --port 9797`

## Architecture Overview

This is a Next.js 15 blog application with server-side rendering and a Monaco-based markdown editor. The architecture follows these patterns:

### Core Technologies

- **Next.js 15** with App Router and React Server Components
- **Turso (LibSQL)** database with Drizzle ORM
- **oxlint and oxfmt** for linting and formatting (tab indentation, 100 char line width, type-aware linting)
- **MDX** with server-side Shiki syntax highlighting for zero-JS code blocks
- **Tailwind CSS v4** for styling
- **Monaco Editor** for markdown editing

### Database Schema

Single `Post` table with fields: `slug` (PK), `title`, `markdown`, `previewMarkdown`, `publicAt`, `createdAt`, `publishedAt`, `modifiedAt`, `locale` (enum: "is", "en")

### Authentication

GitHub OAuth-based authentication with hard-coded email check (`jokull@solberg.is`) in `auth.ts:25`. Uses iron-session for session management.

### App Structure

- `app/(default)/` - Public blog routes
- `app/(admin)/` - Admin routes requiring authentication
- `app/(admin)/[slug]/editor/` - Monaco-based markdown editor with live preview
- `components/` - Shared React components
- `schema.ts` - Drizzle database schema
- `mdx-components.tsx` - Custom MDX component mappings

### URL Structure

- `/` - Post index page
- `/{slug}` - Published post view
- `/{slug}/editor` - Edit/create post (requires auth)
- `/drafts` - Draft posts view

### Key Features

- Server-side syntax highlighting with Shiki (zero client-side JS for code blocks)
- Live preview in editor using MDX compilation
- Draft/publish state management
- Two-locale support (Icelandic/English)

### Development Notes

- Uses `bun` as package manager
- Turbo mode enabled for faster development
- Database runs locally via Turso CLI
- oxlint configured with type-aware linting and strict TypeScript rules; oxfmt handles formatting
- Custom fonts: Inter (sans), Lora (serif), Iosevka (mono)
