# Component diff lists (laptop review, 2026-10-19)

One file per component under diffs/; the cloud job that owns the component reads its file first.

| Component | Verdict | Blockers | Major | Minor | Missing states |
|---|---|---|---|---|---|
| accordion | minor | 0 | 0 | 6 | hover, focus-visible |
| alert | major | 0 | 1 | 1 | - |
| avatar | major | 0 | 2 | 4 | shape=square (listed in the frame's Try it panel, not drawn; no shape prop in the build), bordered (Try it checkbox, not drawn; no prop in the build), status (Try it checkbox, not drawn; no status dot in the build), clickable (Try it checkbox, not drawn; no clickable/hover/focus state in the build) |
| avatar-group | major | 0 | 2 | 4 | - |
| badge | major | 0 | 1 | 2 | - |
| banner | major | 0 | 2 | 4 | - |
| breadcrumb | major | 0 | 3 | 2 | collapsed, hover |
| button | major | 0 | 1 | 1 | hover, active, focus-visible |
| card | major | 0 | 2 | 4 | hover, focus-visible |
| checkbox | major | 0 | 1 | 2 | hover (the frame draws it identical to unchecked: 1 px A1A1A1 line on 262626; the build has no hover class on TOGGLE_BOX either, so parity is likely but no live capture shows it), focus-visible (the frame draws a 2 px 51A2FF ring with a 2 px offset outside the 1 px border; the build defines outline via --tc-ring-width / --tc-ring-offset / outline-ring but no live capture shows a focused box, so width, offset and colour are unverified) |
| code-block | minor | 0 | 1 | 7 | copy hover, copied, no header |
| combobox | major | 0 | 5 | 4 | focus-visible (primary ring), open (listbox popup with selected row and check icon), loading (trailing spinner), empty (no matches helper text) |
| command | major | 0 | 5 | 3 | closed (Ctrl K shortcut hint), typing (filtered list with the match highlighted), empty (centred magnifier icon above 'no results'), loading (centred spinner), selected (primary-tint highlighted row) |
| date-picker | major | 0 | 4 | 6 | idle (closed trigger), selected (closed trigger with value), today (closed trigger), disabled, invalid |
| dialog | major | 0 | 2 | 5 | alert (trigger exists, not captured), scrolled (trigger exists, not captured), focus trapped (trigger exists, not captured; frame draws a 2 px #51A2FF ring offset 2 px around the popup) |
| drawer | major | 0 | 1 | 7 | dragging - the frame draws the moving sheet at about 60% opacity (#1E1E1E over #121212) with a lighter 24px strip on its leading edge; not captured, and DRAWER_FOLLOW only translates the sheet (data-swiping:select-none), no opacity change, focus trapped - the frame draws a 2px #51A2FF bar 2px inside the sheet's leading edge; not captured (the build has FOCUS_RING_INSET on the popup, a four-sided inset ring on focus-visible, which would look different) |
| dropdown | major | 0 | 5 | 3 | hover item (primary tint row with primary text and icon, ~6px radius, inset ~5px from the menu edge), submenu (item with trailing chevron-right), checked (item with end-aligned primary check mark) |
| empty-state | major | 0 | 3 | 5 | compact |
| file-upload | major | 0 | 3 | 5 | drag over, uploading (file row with progress bar), done, error (rejected file row) |
| input | major | 0 | 4 | 2 | hover (live-only; not captured, and the build has no hover rule, see rows), focus-visible (live-only; not captured. By code FOCUS_RING is 2px outline at 2px offset in --tc-ring = blue-400 in dark, which matches the frame's 2px/2px ring in #51a2ff; unverified in the capture) |
| kbd | major | 0 | 3 | 2 | active (pressed), disabled |
| navbar | major | 0 | 7 | 3 | scrolled, mobile, open menu, focus-visible, transparent |
| number-field | major | 0 | 1 | 3 | hover, focus-visible, at-limit |
| otp-field | major | 0 | 1 | 4 | focus-visible (2px rgb(81,162,255) ring inset at the cell edge, box size unchanged) - no live capture shows a focused cell, partly filled (4 8 _ _) as its own state, complete (4 8 2 9) as its own plain state; the build only shows all digits under read-only |
| pagination | major | 0 | 5 | 2 | disabled |
| popover | major | 0 | 4 | 2 | flipped, focus-visible, dismissed |
| progress | major | 0 | 3 | 1 | - |
| radio-group | major | 0 | 3 | 0 | hover (strip draws it pixel-identical to unselected; not captured live), focus-visible (frame: 2 px #51A2FF ring at 2 px offset; build declares the same via TOGGLE_RING but no live capture shows it) |
| rating | major | 0 | 2 | 2 | hover, focus-visible |
| segmented-control | major | 0 | 2 | 2 | hover, focus-visible |
| select | major | 0 | 3 | 1 | selected option (primary tint #101e3b row, #51a2ff text, 14px check icon at the end, ~6px row radius, 6px inset) - the live open popup has no value chosen so nothing selected is drawn, hover (1px #636363 line) - hidden under the open popup in the states capture, focus-visible (2px #51a2ff ring, 2px offset, line-strong border) - hidden under the open popup, disabled (transparent fill, near-invisible line, #5c5c5c text and chevron) - hidden under the open popup, invalid (1px #e7000b border plus a 2px #e7000b ring 2px outside the box) - hidden under the open popup; note the build's FIELD_INVALID draws the danger ring inset, which would differ from the frame's outer ring if it were visible |
| separator | major | 0 | 1 | 1 | with label |
| sidebar | major | 0 | 4 | 5 | hover, focus-visible |
| skeleton | major | 0 | 1 | 4 | - |
| slider | major | 0 | 2 | 3 | hover, active, focus-visible |
| spinner | matches | 0 | 0 | 0 | - |
| stepper | major | 0 | 3 | 3 | disabled |
| switch | major | 0 | 4 | 1 | focus-visible (frame draws a 2 px #51A2FF ring at a 1 px offset around the unchanged off track; not captured in the states demo), hover (frame draws it identical to off: no colour, border or thumb change; not captured in the states demo) |
| table | major | 0 | 4 | 5 | hover row, selected |
| tabs | major | 0 | 3 | 2 | focus-visible (frame: 2px ring in --tc-ring (81,162,255) at 2px offset, ~8px radius, around the 32px tab box with the blue indicator still drawn below it; not captured in the build), disabled list (frame: whole list at ~50% opacity: active label (136,136,136), inactive labels (92,92,92), indicator dimmed to (22,58,137), hairline dimmed to (30,30,30); the build only shows one disabled tab inside an enabled list) |
| tag | major | 0 | 3 | 5 | hover, active, focus-visible, disabled |
| textarea | minor | 0 | 0 | 4 | hover, focus-visible, at limit |
| timeline | major | 0 | 2 | 6 | loading |
| toast | major | 0 | 1 | 6 | stacked (collapsed stack): built as a plain column, a recorded decision, limited (ghost at ~40%): built as display:none, success, error and loading icons and the entering fade: present in the code (TOAST_ICONS, FADE_MOTION) but in neither capture, so unverified |
| tooltip | major | 0 | 2 | 5 | hidden |
| tree-view | major | 0 | 4 | 5 | focus-visible |
