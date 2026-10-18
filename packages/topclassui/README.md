# topclassui

RTL-first, server-first React components for Next.js 15+ and Tailwind CSS v4, built on Base UI.

**Beta.** This is `0.x`: a breaking change can land in a minor. Each one is listed in [CHANGELOG.md](./CHANGELOG.md) with a migration note.

## Install

```sh
npm i topclassui@beta zod
npm i -D tailwindcss @tailwindcss/postcss
```

`zod` ships with the package; naming it here puts it in your own `package.json`, so your code can import it for your own schemas.

## CSS

`app/globals.css`, in this order:

```css
@import "tailwindcss";
@import "topclassui/tokens.css";
@import "topclassui/styles.css";
```

## Layout

`app/layout.tsx`. Direction and locale come from the layout, never from `document.dir`:

```tsx
import { TopClassProvider } from 'topclassui/provider'
import { ThemeScript } from 'topclassui/theme'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>
      </body>
    </html>
  )
}
```

For Arabic: `lang="ar" dir="rtl"` and `direction="rtl" locale="ar"`. Every component follows.

## Example

`app/page.tsx`, a Server Component:

```tsx
import { Button } from 'topclassui/button'
import { Icon } from 'topclassui/icon'

export default function Page() {
  return <Button tone="primary"><Icon name="check" /> Save</Button>
}
```

No `transpilePackages`: the package is plain ESM JavaScript. A component that needs the browser (`DialogRoot`, `Select`, `ToastViewport`, ...) carries its own `'use client'`, so you import it from a Server Component the same way.

## Imports

There is no root import; every entry is a subpath.

| Import | What |
|---|---|
| `topclassui/<component>` | one component folder, see the list below |
| `topclassui/provider` | `TopClassProvider` |
| `topclassui/theme` | `ThemeScript`, `THEME_STORAGE_KEY` |
| `topclassui/cn` | `cn()`, class merging that knows the library's utilities |
| `topclassui/classes` | the shared class constants (`FOCUS_RING`, `HOVER`, `TOUCH_TARGET`, ...) for your own components |
| `topclassui/labels/en`, `topclassui/labels/ar` | the built-in strings, for the `labels` prop |
| `topclassui/icons/<name>` | one icon's data, for example `topclassui/icons/check` |
| `topclassui/schemas/<component>`, `topclassui/meta/<component>` | the zod schema and the catalog entry of a component |
| `topclassui/tokens.css`, `topclassui/styles.css` | the CSS above |

### Components

`accordion` `alert` `avatar` `avatar-group` `badge` `banner` `breadcrumb` `button` `card` `checkbox` `code-block` `combobox` `command` `date-picker` `dialog` `drawer` `dropdown` `empty-state` `field` `file-upload` `form` `icon` `icon-registry` `input` `kbd` `meter` `navbar` `number-field` `otp-field` `pagination` `popover` `progress` `radio-group` `rating` `segmented-control` `select` `separator` `sidebar` `skeleton` `slider` `spinner` `stepper` `svg` `switch` `table` `tabs` `tag` `textarea` `timeline` `toast` `tooltip` `tree-view`

Every component with a visual scale takes `size` (`xs | sm | md | lg | xl | custom`, default `md`), spreads the rest of its props onto its root element, and reads its text from the `labels` prop with English defaults.

## Next.js

App Router, Next.js 15 or 16. `topclassui/icon` is the async `<Icon name="check" />` for Server Components; it imports `server-only`, so a client file that imports it fails the build on purpose. In a client file use `topclassui/svg` with an explicit icon import:

```tsx
import { Svg } from 'topclassui/svg'
import { check } from 'topclassui/icons/check'

<Svg icon={check} />
```

## Vite

React 19 with `@tailwindcss/vite`: the same install, the same three CSS lines, `TopClassProvider` around the app in `main.tsx`. There is no server, so icons go through the registry, not `topclassui/icon`:

```tsx
import { Icon, registerIcons } from 'topclassui/icon-registry'
import { check } from 'topclassui/icons/check'

registerIcons({ check })
```

Vite prints a "module level directive" warning for each `'use client'` file. It is harmless.

## Links

- Site: https://topclassui.com
- Source and issues: https://github.com/TopClassUI/topclassui
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

## License

MIT, see [LICENSE](./LICENSE).
