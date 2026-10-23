---
"topclassui": patch
---

A disabled control shows the not-allowed cursor and still ignores a press: `DISABLED` is `opacity-50` plus `NOT_ALLOWED` with no `pointer-events-none`, the hover and active variants skip `:disabled`, `[aria-disabled="true"]` and `[data-disabled]`, and a disabled row in a list, menu, tree or calendar takes no highlight. A Button rendered as another element keeps its pointer block.
