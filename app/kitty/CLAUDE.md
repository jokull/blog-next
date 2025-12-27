# Kitty Theme Builder - Developer Documentation

This directory contains the Kitty Theme Builder feature - a web-based visual editor for creating and sharing color themes for the Kitty terminal emulator.

## Architecture Overview

### Technology Stack

- **Next.js 15** - App Router with React Server Components
- **Drizzle ORM + Turso** - Database with `kitty_theme` table
- **OKLCH Color Space** - Perceptually uniform color editing via `culori` library
- **Intent UI** - Component library for forms, buttons, dialogs
- **GitHub OAuth** - Authentication via blog's existing auth system

### Color Philosophy

This feature uses **OKLCH** (Oklab cylindrical) instead of RGB/HSL because it's perceptually uniform:

- **L** (Lightness): 0-1 - perceived brightness
- **C** (Chroma): 0-0.37 - saturation intensity
- **H** (Hue): 0-360° - color angle

This allows independent adjustment of brightness, colorfulness, and hue for harmonious color schemes.

## File Structure

```
app/kitty/
├── CLAUDE.md                    # This file
├── page.tsx                     # Server component wrapper (fetches data)
├── layout.tsx                   # Full-width layout override
├── actions.ts                   # Server actions for CRUD operations
├── _lib/
│   ├── types.ts                 # TypeScript interfaces (KittyTheme, OklchColor, ColorKey)
│   ├── color-utils.ts           # OKLCH conversion utilities
│   ├── default-theme.ts         # NightOwl Chroma default theme
│   ├── theme-parser.ts          # Parse Kitty .conf files, fetch from GitHub
│   ├── culori.d.ts              # Type definitions for culori/fn
│   └── culori-main.d.ts         # Type definitions for culori
└── _components/
    ├── kitty-client.tsx         # Main client component with all state management
    ├── theme-browser.tsx        # Left sidebar: search, filter, theme list
    ├── theme-metadata.tsx       # Theme name, description, action buttons
    ├── color-selector.tsx       # 21 colors in 3 groups (0-7, 8-15, basic)
    ├── color-editor.tsx         # Edit selected color with OKLCH picker
    ├── theme-preview.tsx        # Live terminal preview
    ├── import-dialog.tsx        # Modal to import from Kitty official repo
    ├── export-button.tsx        # Generate and copy .conf file
    └── oklch/
        ├── oklch-picker.tsx     # Container for L/C/H sliders
        └── oklch-slider.tsx     # Canvas-rendered gradient slider (core component)
```

## Database Schema

**Table:** `kitty_theme`

```typescript
{
  id: number (PK, auto-increment)
  slug: string (unique)
  name: string
  authorGithubId: number
  authorGithubUsername: string
  authorAvatarUrl: string
  isPublished: boolean
  forkedFromId: number | null (FK to kitty_theme.id)
  blurb: string | null
  colors: JSON {
    color0-15: OklchColor  // 16 ANSI colors
    foreground: OklchColor
    background: OklchColor
    cursor: OklchColor
    selection_foreground: OklchColor
    selection_background: OklchColor
  }
  createdAt: timestamp
  modifiedAt: timestamp | null
}
```

## Key Components

### 1. OklchSlider (`_components/oklch/oklch-slider.tsx`)

**Critical Component** - Canvas-rendered gradient slider that visualizes OKLCH color variations.

**How it works:**

- Uses HTML5 Canvas to render a gradient showing color variations along L, C, or H axis
- Transparent range input overlaid on canvas for user interaction
- Gradient updates in real-time as other channels change
- Uses `culori/fn` for OKLCH ↔ CSS color conversion

**Important:** The `useMode` call at the top level is intentional and linted away with `// eslint-disable-next-line react-hooks/rules-of-hooks` because it's not actually a React hook despite the name.

### 2. KittyClient (`_components/kitty-client.tsx`)

**Main orchestrator** - Manages all state and coordinates between components.

**State Management:**

- `currentTheme` - Local state for editing
- `savedTheme` - Last saved state from server
- `selectedColor` - Which of 21 colors is being edited
- `hasUnsavedChanges` - Derived from comparing current vs saved
- `forkedFrom` - Attribution info if theme is a fork

**Key Patterns:**

- Uses `useTransition` for server action loading states
- Warns before leaving with unsaved changes via `beforeunload` event
- All mutations go through server actions with optimistic UI updates

### 3. Server Actions (`actions.ts`)

**Authentication Pattern:**

```typescript
// Owner OR admin can edit
const isOwner = theme.authorGithubUsername === session.githubUsername;
const isAdminUser = await isAdmin();
if (!isOwner && !isAdminUser) throw new Error("Unauthorized");
```

**Available Actions:**

- `getPublishedThemes()` - Public, no auth required
- `getUserThemes()` - Fetch current user's themes
- `createTheme(data)` - Auth required
- `updateTheme(id, updates)` - Owner or admin
- `togglePublish(id)` - Owner or admin
- `forkTheme(originalId)` - Auth required, original must be published
- `deleteTheme(id)` - Owner or admin
- `getForkedFromTheme(id)` - Fetch attribution info

**Pattern:** All actions call `revalidatePath("/kitty")` to refresh cached data.

## Development Patterns

### Adding a New Color Property

If you need to add a 22nd color (e.g., `url_color`):

1. **Update types** (`_lib/types.ts`):

    ```typescript
    colors: {
      // ... existing colors
      url_color: OklchColor;
    }
    ```

2. **Update colorLabels** (`_lib/types.ts`):

    ```typescript
    url_color: "URL Color",
    ```

3. **Update default-theme.ts**:

    ```typescript
    url_color: { l: 0.7, c: 0.15, h: 240 },
    ```

4. **Update color-selector.tsx** - Add to appropriate group (likely `basicColors` array)

5. **Update export-button.tsx** - Add line to generated config

### Testing a Theme

1. Create a theme in the UI
2. Click "Copy to Clipboard"
3. Save to `~/.config/kitty/themes/your-theme.conf`
4. In Kitty: `kitty +kitten themes` and select your theme

### Importing from Official Repo

The import dialog fetches from:

- **Theme list**: `https://raw.githubusercontent.com/kovidgoyal/kitty-themes/master/themes.json`
- **Theme files**: `https://raw.githubusercontent.com/kovidgoyal/kitty-themes/master/{file}`

Themes are parsed using regex to extract:

- Metadata comments (`## name:`, `## author:`, `## blurb:`)
- Color definitions (hex values converted to OKLCH)
- Merged with `defaultTheme` to ensure all 21 colors exist

## Common Tasks

### Fix OKLCH Gradient Rendering

If gradients look wrong in `oklch-slider.tsx`:

1. Check canvas dimensions (300x32px)
2. Verify loop covers full width: `for (let x = 0; x < width; x++)`
3. Ensure `formatCss(oklch(gradientColor))` is used for CSS color conversion
4. Check that `willReadFrequently: false` is set on canvas context

### Update Intent UI Components

If Intent UI components need updating:

```bash
npx shadcn@latest add @intentui/button @intentui/text-field -o
bun run format-and-lint:fix
```

Check for breaking changes in:

- Import statements (named exports, not default)
- Prop names (e.g., `disabled` vs `isDisabled`)
- Component structure (e.g., TextField children patterns)

### Debug Authentication Issues

Check these in order:

1. **Session exists**: `const session = await getSession()` in page.tsx
2. **Auth redirect**: `/auth/login?next=/kitty` includes return URL
3. **Dev mode shortcut**: `/api/dev-auth` auto-authenticates as "jokull"
4. **Server action auth**: Each action checks `requireAuth()` or validates session

## Performance Considerations

### State Management

- **Real-time editing**: All color changes update local state immediately
- **Server persistence**: Only save to DB when user clicks "Save"
- **Optimistic updates**: Use `useTransition` for loading states, update local state before server confirms

### Color Conversion

- `culori` library handles OKLCH ↔ RGB conversion
- Canvas gradients are memoized by `useEffect` dependencies
- Only re-render gradient when `color`, `channel`, `min`, or `max` changes

### Database Queries

- Published themes fetched once on page load
- User themes fetched only if authenticated
- No pagination yet (assumes <1000 themes total)
- Fork info fetched lazily when viewing a forked theme

## Troubleshooting

### "Cannot fork unpublished theme"

- Themes must be published (`isPublished: true`) to be forkable
- Check theme ownership - can't fork your own themes (just edit them)

### Canvas gradient not updating

- Verify `useEffect` dependencies in `oklch-slider.tsx` line 32
- Check that `color` object reference is changing (not mutating)
- Ensure `modeOklch` is imported from `culori/fn`

### Type errors with `colors` field

- Database returns `any` for JSON columns
- Always cast to `KittyThemeType["colors"]` after DB queries
- Use `// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment` for unavoidable casts

### Theme not appearing in browser

- Check `isPublished` is true for public visibility
- Verify `authorGithubUsername` matches current user for "My Themes"
- Run `revalidatePath("/kitty")` after mutations
- Check browser console for errors

## Future Enhancements

Potential improvements (not yet implemented):

1. **Contrast Checker** - Validate foreground/background contrast ratios (WCAG)
2. **Color Palette Generator** - Auto-generate harmonious ANSI colors from base colors
3. **Preview Templates** - Show more realistic terminal output (git diff, ls, etc.)
4. **Tags/Categories** - Organize themes by style (dark/light, colorful/minimal, etc.)
5. **Likes/Ratings** - Community feedback on published themes
6. **Export Formats** - Support other terminals (iTerm2, Alacritty, Windows Terminal)
7. **Accessibility** - Add ARIA labels, keyboard navigation for color selection
8. **Undo/Redo** - History management for color edits

## Related Documentation

- **Kitty Terminal**: https://sw.kovidgoyal.net/kitty/
- **OKLCH Color Space**: https://oklch.com/
- **Culori Library**: https://culorijs.org/
- **Intent UI**: https://intentui.com/docs
- **Blog Auth System**: See `/Users/jokull/Code/blog-shud/auth.ts`

## Maintenance Notes

### Dependencies

- **culori** - Update carefully, API may change
- **Intent UI** - Components copied into project, not auto-updated
- **React 19** - Using new features (useTransition, Server Components)

### Database Migrations

If schema changes needed:

```bash
# 1. Edit schema.ts
# 2. Generate migration
bun run generate:migration
# 3. Apply migration
bun run run:migration
```

### Linting

This feature uses:

- **oxlint** for TypeScript linting (type-aware, strict mode)
- **oxfmt** for formatting (tabs, 100 char line width)
- All files must pass `bun run format-and-lint`

## Contact

For questions about this feature, see the main blog's CLAUDE.md or consult the implementation plan at `/Users/jokull/.claude/plans/piped-roaming-cat.md`.
