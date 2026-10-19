# accordion: Figma frame vs live build

Verdict: **minor**. Blockers 0, major 0, minor 6.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| geometry: trigger row height | Each closed trigger row is ~42px tall (centres 42px apart) with ~13px vertical padding around a ~16px label | Each trigger row is ~49px tall (centres 49px apart) with ~17px vertical padding around a ~14px label | Trim the trigger's block padding by ~3-4px per side (or size the row from the md control-height knob) so a closed row lands at ~42px | minor |
| geometry: open panel spacing | Panel text starts ~12px under the trigger label and the next trigger centre sits ~43px below the panel's last line | Panel text starts ~38px below the trigger centre (same as frame) but the next trigger centre sits ~51px below the panel's last line, ~8px roomier | Reduce the panel's bottom padding by ~8px | minor |
| type: trigger label and panel text | Trigger label ~16px, medium (500), body colour; panel text ~15-16px, muted, 18px line-height | Trigger label ~14px, semibold/bold; panel text ~14px muted | Set the trigger label to text-base font-medium and the panel to text-base text-muted | minor |
| state: stage default (open item) | Stage sample has the first item open, showing its panel text under the trigger with chevron-up | Basic demo renders all three items closed; no panel visible | Pass defaultValue for the first item in the basic/playground demo, as the code tab shows (defaultValue={['install']}) | minor |
| state: hover | States strip draws a hover state: trigger surface a step lighter than the closed item | No hover state captured | Add a hover capture (or a forced :hover state) to the states demo and confirm the trigger uses the shared hover class | minor |
| state: focus-visible | States strip draws a focus ring around the focused trigger item | No focus-visible state captured | Add a focus-visible capture to the states demo and confirm the trigger carries the shared --tc-ring focus-visible class | minor |

Missing states: hover, focus-visible

Notes: Sample content differs and is not counted: the frame's states strip draws one single-item accordion per state ("Question"/"answer"), while the built states demo groups "Open", "Disabled" and "Closed" items in one accordion plus a separate "Every item disabled" group; stage copy matches (same three questions). Font family ignored per instructions. What matches: raised-surface container with ~12px radius and no visible border, no divider lines between items, ~16px chevron at the inline end in muted colour (down when closed, up when open), ~16px inline padding, disabled rendering (muted label and muted chevron on the same surface), open-state surface identical to closed. Container width is 400px in the frame vs 420px built, treated as demo sizing rather than a component difference. Overall the build reads as the same component with slightly roomier rows, a smaller/heavier label, and a basic demo that does not open the first item.
