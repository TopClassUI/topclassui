---
"topclassui": patch
---

Navbar measures its height on its ResizeObserver's first report instead of during the commit, so hydration forces no layout; `--tc-sticky-top`, `data-scrolled` and the `#anchor` correction land one frame after hydration.
