---
"topclassui": minor
---

The `topclassui` bin: `npx topclassui init` sets a Next.js App Router or Vite React project up, `add <component>` copies a component and what it imports into one `topclassui/` folder, `diff` compares the copies with this version, `list` names the components. The registry ships inside the package.

Banner, Tag and Rating take no function on their server exports; the client exports carry the callbacks (`TagRemovable` with `onRemove`, the banner's dismiss and the editable rating with `onValueChange`).

`TopClassProvider` warns once in development when the layout leaves out `direction` or `locale`. The tooltip popup carries `role="tooltip"` and its trigger `aria-describedby`. The icon's RTL mirror uses the `--tc-dir` knob. Every rule the plan listed as planned or manual is now an automated check.
