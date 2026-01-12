# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server:** `bun dev` (orchestrates Next.js + Turso DB using concurrently)
    - `bun run dev:next` - Run only Next.js dev server (with Turbo mode)
    - `bun run dev:db` - Run only Turso local database
- **Build:** `bun run build`
- **Linting and formatting:** `bun run format-and-lint` (check only) or `bun run format-and-lint:fix` (fix issues)
- **Database migrations:** `bun run generate:migration` (generate) and `bun run run:migration` (apply)

### CLI Tool

A command-line interface for managing blog posts is available at `cli/blog.ts`:

```bash
bun run blog <command> [options]
```

**Commands:**

- `login` - Authenticate via browser (opens GitHub OAuth flow, stores token in `~/.blog-cli-session`)
- `logout` - Clear stored authentication
- `list` - List all posts with status, slug, title, and date
- `get <slug>` - View full post details and content
- `create` - Create a new post (requires `--slug` and `--title`)
- `update <slug>` - Update an existing post
- `delete <slug>` - Delete a post
- `categories` - List available categories
- `backup` - Backup all posts to iCloud Documents (`~/Library/Mobile Documents/.../blog-backup/`)

**Common options:**

- `-s, --slug` - Post slug
- `-t, --title` - Post title
- `-b, --body` - Post body (markdown)
- `-f, --body-file` - Read body from file
- `-c, --category` - Category slug
- `-l, --locale` - Locale (`en` or `is`)
- `--hero-image` - Hero image URL
- `--publish` / `--unpublish` - Toggle publish state

**Environment:**

- `BLOG_API_URL` - API base URL (default: `http://localhost:3000`)

## Architecture Overview

This is a Next.js 15 blog application with server-side rendering and a Monaco-based markdown editor. The architecture follows these patterns:

### Core Technologies

- **Next.js 15** with App Router and React Server Components
- **Turso (LibSQL)** database with Drizzle ORM
- **oxlint and oxfmt** for linting and formatting (tab indentation, 100 char line width, type-aware linting)
- **MDX** with server-side Shiki syntax highlighting for zero-JS code blocks
- **Tailwind CSS v4** for styling
- **Monaco Editor** for markdown editing
- **Intent UI** component library (via shadcn CLI)

### Intent UI Component Management

This project uses Intent UI components managed via the shadcn CLI. Components are copied into `components/ui/` and can be customized.

Full docs: https://intentui.com/llms.txt

#### Configuration Files

- **`components.json`** - Main configuration for shadcn CLI (registry, aliases, style settings)
- **`intentui.json`** - Legacy config file (kept for reference, not actively used)
- **`app/globals.css`** - CSS variables for theming (colors, radii, spacing)

#### Adding New Components

```bash
# Add a single **component**
npx shadcn@latest add @intentui/button

# Add multiple components
npx shadcn@latest add @intentui/button @intentui/dialog @intentui/select

# Add all components (not recommended)
npx shadcn@latest add @intentui/all
```

#### Updating Existing Components

```bash
# Update components with -o flag (overwrites existing files)
npx shadcn@latest add @intentui/button -o

# Update multiple components
npx shadcn@latest add @intentui/button @intentui/dialog @intentui/select -o
```

**IMPORTANT:** Always review changes after updating:

1. Run `git diff` to check what changed
2. Run `bun run format-and-lint:fix` to catch breaking changes
3. Update component usages if APIs changed
4. Test affected pages

#### Component API Patterns

Intent UI components use react-aria-components with specific patterns:

**Named Exports (not object properties):**

```tsx
// ✅ Correct
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";

// ❌ Wrong
import { Dialog } from "@/components/ui/dialog";
<Dialog.Header> // This won't work
```

**Common Component Structures:**

- **Dialog:** Requires `ModalOverlay` + `Modal` wrapper from react-aria-components
- **Select:** Requires `SelectTrigger` + `SelectContent` structure
- **TextField:** Wrapper that accepts `Label`, `Input`, `Description`, `FieldError` as children
- **Textarea:** Uses `disabled` prop (not `isDisabled`), `onChange` expects event handler

**Debug/Test Page:**

- Visit `/ui` to see all components in action
- Use this page to verify components after updates

#### Custom Styling

CSS variables in `app/globals.css` control theming. Changes persist across component updates:

- `--primary`, `--secondary`, `--danger`, `--warning`, `--success` - Color palette
- `--radius-*` - Border radius scale
- `--bg`, `--fg` - Background and foreground colors
- Dark mode variants in `.dark` selector

#### Troubleshooting

**After component updates, if you see errors:**

1. Check component import statements (named exports, not default)
2. Verify prop names (e.g., `disabled` vs `isDisabled`)
3. Check for structural changes (e.g., Dialog now needs ModalOverlay)
4. Run `bun run format-and-lint:fix` to catch type errors
5. Review Intent UI docs: https://intentui.com/docs/components

**Common migration patterns:**

- `DialogTrigger` + `DialogOverlay` → `ModalOverlay` + `Modal`
- `onChange={setState}` → `onChange={(e) => setState(e.target.value)}`
- `isDisabled` → `disabled` (for native HTML props)

### Database Schema

Single `Post` table with fields: `slug` (PK), `title`, `markdown`, `previewMarkdown`, `publicAt`, `createdAt`, `publishedAt`, `modifiedAt`, `locale` (enum: "is", "en")

### Authentication

**GitHub OAuth** with iron-session for encrypted cookie-based sessions. Admin access restricted to GitHub username `"jokull"` (`auth.ts:75`).

#### Key Functions (auth.ts)

- `requireAuth(currentUrl?)` - Redirects to GitHub OAuth if not authenticated, returns username if authenticated
- `requireAdmin(currentUrl?)` - Like `requireAuth()` but throws error if username !== "jokull"
- `isAdmin()` - Returns boolean, checks if current user is admin
- `getSession()` - Returns iron-session with `githubUsername` field

#### Protecting Routes

```tsx
// Server Component - redirect to login
import { requireAdmin } from "@/auth";

export default async function AdminPage() {
	await requireAdmin(); // or requireAuth() for any authenticated user
	// ... rest of component
}
```

#### Development Shortcut

**In development:** Visit any protected route and you'll auto-redirect to `/api/dev-auth`, which sets session to `"jokull"` without GitHub OAuth.

#### OAuth Flow (Production)

1. `requireAuth()` → redirects to GitHub OAuth
2. GitHub → redirects to `/callback?code=...`
3. Callback validates code, fetches GitHub user, stores `githubUsername` in session
4. Redirects to original destination

**Session details:** 1-year cookie, httpOnly, stores only `githubUsername`, encrypted with `GITHUB_CLIENT_SECRET`

### App Structure

- `app/(default)/` - Public blog routes
- `app/admin/` - Admin dashboard (requires authentication)
- `app/(admin)/[slug]/editor/` - Monaco-based markdown editor with live preview
- `components/` - Shared React components
- `schema.ts` - Drizzle database schema
- `mdx-components.tsx` - Custom MDX component mappings

### URL Structure

- `/` - Post index page
- `/{slug}` - Published post view
- `/{slug}/editor` - Edit/create post (requires auth)
- `/admin` - Admin dashboard with all posts and categories

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
