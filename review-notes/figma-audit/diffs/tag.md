# tag: Figma frame vs live build

Verdict: **major**. Blockers 0, major 3, minor 5.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| geometry: height | md tag is ~29-30 px tall (text 14 px + ~7 px vertical padding), e.g. 'primary' 76x29, 'neutral' 71x29 | md tag is ~34 px tall ('Design systems' 124x34, 'Plain' 57x34); horizontal padding ~12 px matches | Tag md should use a chip-height knob around 28-30 px (py of ~6 px on a 14 px line) rather than the 34-36 px button control height; keep px-3 | major |
| type: weight | label is regular weight (400), ~14 px | label is semibold (~600), ~14 px | Use font-normal (medium at most) on the LABEL element; the chip reads heavier than the frame | major |
| states strip: hover, active, focus-visible, disabled | draws five states of the same primary soft tag: idle, hover (tint one step lighter), active (tint brighter/more saturated), focus-visible (2 px primary ring with ~2 px offset, outer radius ~6 px), disabled (~50% opacity) | states demo renders only 'Plain' and 'Removable x' at idle; no hover, active, focus-visible or disabled rendering | Make the states demo render idle, hover (forced data-hover), active, focus-visible (RING from shared/classes with 2 px offset) and disabled (opacity ~0.5, pointer-events none) so the strip matches the frame | major |
| radius | corner radius ~4 px (small step) | corner radius ~6 px | Use the small radius knob (--tc-radius-sm) for Tag instead of the md radius | minor |
| borders/lines | soft tag is a flat tint with no visible stroke | a faint 1 px lighter line is visible around the tag | Drop the border on the soft variant (border-transparent) or reserve a line for an outline variant only | minor |
| surface colour: neutral soft tint | neutral tag sits on a clearly raised neutral tint (~#2a2a2a-level), well separated from the #0b0b0b stage | neutral tag bg is darker (~#1c1c1c-level), close to the raised-surface token, so it barely lifts off the page | Map tone=neutral soft to the neutral tint token one step lighter than surface-raised | minor |
| dismiss icon: spacing | gap between label and the x is ~6-8 px; x is ~12 px with ~12 px end padding | gap between label and the x is ~14 px; x is ~12 px with ~12 px end padding | Use gap-1.5/gap-2 between LABEL and the remove button instead of gap-3; keep the icon at the 12 px size | minor |
| dismiss icon: colour | the x takes the tone's text colour (danger red on the danger tag) | the x is muted grey while the label is body white on the neutral tag | Let the remove icon inherit currentColor of the tag text (full tone colour at idle, not text-muted) | minor |

Missing states: hover, active, focus-visible, disabled

Notes: Sample content differs and is not counted: the Figma stage shows five soft tones side by side (primary, neutral, success, warning, danger with x) and the states strip repeats 'design' in primary; the build captures show 'Design systems', 'Plain' and 'Removable x' in the neutral tone only. Because no capture shows the primary/success/warning/danger tints or the primary focus ring, those tone tints and the ring colour could not be verified. Gap between tags (8 px), horizontal padding (~12 px), text size (~14 px) and the 12 px dismiss icon size match. Font family ignored per instructions.
