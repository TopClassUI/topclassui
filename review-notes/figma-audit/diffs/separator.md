# separator: Figma frame vs live build

Verdict: **major**. Blockers 0, major 1, minor 1.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| With label state | Drawn twice: on the stage (two 121 px hairlines flanking the text 'or' at x 350-360, text about 10-11 px, muted #8e8e8e, 10-11 px clear on each side, line centred on the text x-height) and in the strip (40 px line, 9 px gap, 'or', 9 px gap, 40 px line). | No labelled form exists: SeparatorProps omits children, the schema has only orientation and decorative, and the states demo renders only Horizontal and Vertical. | Either add a label slot (root becomes flex items-center with GAP from the knobs, two flex-1 hairlines and a text-xs text-muted span, role separator kept on the root) or keep the omission already recorded in docs/DECISIONS.md line 520 and remove the state from the frame so the parity check can pass. | major |
| Vertical state height | Standalone 1 px line 40 px tall (y 680-719) with no flanking text. | 1 px line 20 px tall (y 149-168), stretched to an h-5 row between 'Draft' and 'Edited 2 hours ago'. | Demo-level only: the component is self-stretch and takes the row height, as the frame's own caption says. Give the states demo row h-10 if the strip should draw the same 40 px. | minor |

Missing states: with label

Notes: Sample content differs and is not counted: the Figma stage and strip draw bare lines, while the live horizontal demo puts the line between 'Personal details' and a muted sentence and the states demo flanks the vertical with 'Draft' / 'Edited 2 hours ago'. Line colour and thickness match exactly: the Figma strokes resolve to #262626 (neutral-800 = --tc-line) at 1 px, drawn on a half pixel so they anti-alias to two #181818 rows on the #0a0a0a stage and #1e/#1f rows on the #171717 strip; the build renders a crisp 1 px #262626 border. Horizontal widths (300 px stage, 110 px strip versus 880 px and 320 px live) are container-driven because the component is w-full, so not counted. The Try-it panel lists a 'spacing' knob (md) the build has no prop for; nothing on the stage shows what it changes, so no row. The single major row is a known, decided gap (DECISIONS.md line 520: Separator is built without the label that is drawn); if that decision stands, the component otherwise matches.
