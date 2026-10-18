# topclassui

## 0.1.0-beta.1

### Minor Changes

- The `topclassui` bin: `npx topclassui init` sets a Next.js App Router or Vite React project up, `add <component>` copies a component and what it imports into one `topclassui/` folder, `diff` compares the copies with this version, `list` names the components. The registry ships inside the package.
  
  Banner, Tag and Rating take no function on their server exports; the client exports carry the callbacks (`TagRemovable` with `onRemove`, the banner's dismiss and the editable rating with `onValueChange`).
  
  `TopClassProvider` warns once in development when the layout leaves out `direction` or `locale`. The tooltip popup carries `role="tooltip"` and its trigger `aria-describedby`. The icon's RTL mirror uses the `--tc-dir` knob. Every rule the plan listed as planned or manual is now an automated check.

## 0.1.0-beta.0

### Minor Changes

- 550ec89: First beta. 52 component entries as subpath imports (`topclassui/button`, `topclassui/dialog`, ... every folder under `src/components/` with an `index.tsx`, every one `status: beta`), `topclassui/provider` (`TopClassProvider`), `topclassui/theme` (`ThemeScript`), `topclassui/cn`, `topclassui/classes`, the English and Arabic labels (`topclassui/labels/en`, `topclassui/labels/ar`), 84 icons as modules (`topclassui/icons/<name>`), `topclassui/tokens.css`, `topclassui/styles.css`, and the schemas and meta files (`topclassui/schemas/<slug>`, `topclassui/meta/<slug>`). Not in it: the CLI, connectors, `@topclassui/next`, `@topclassui/vite`, size budgets, provenance.
