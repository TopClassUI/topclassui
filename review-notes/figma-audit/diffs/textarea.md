# textarea: Figma frame vs live build

Verdict: **minor**. Blockers 0, major 0, minor 4.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| resize handle | No resize grip drawn on the stage box or on any of the six state boxes; the bottom-end corner is clean. | Native browser resize grip (diagonal hatch) visible at the bottom-end corner of every box, including the disabled one. | Add resize-none (or resize-y only when autosize is off) to the textarea classes and hide the grip when disabled. | minor |
| idle border | Idle box carries only a hairline that is barely distinguishable from the raised surface (line role); the hover state is where a clearly visible 1px lighter line (line-strong) appears. | Idle box already has a clearly visible 1px mid-grey border, so idle reads like the frame's hover state. | Use border-line at rest and switch to border-line-strong under hover only. | minor |
| invalid / at-limit border | Invalid and at-limit boxes draw a ~2px red stroke on the box edge, visibly heavier than the 1px rest border. | Invalid box ('Too short') draws a 1px red border at the same weight as the rest border. | Give the invalid state the 2px danger ring (ring token in the danger tone) on the border rather than only recolouring the 1px border. | minor |
| disabled surface | Disabled box drops the raised fill toward the page background and dims the border as well as the text. | Disabled box ('Sent on Monday') keeps the full raised surface and the full-strength 1px border; only the text goes muted. | Under disabled, use the canvas/transparent surface and reduce the border opacity along with the text. | minor |

Missing states: hover, focus-visible, at limit

Notes: Sample content differs: the frame's stage shows a typed value ('Tell us what you think about TopClass UI.', ~300px wide) with a live counter '42 / 500' right-aligned ~12px under the box; the build's basic demo renders the Field wrapper (label 'About you', hint 'A short paragraph is enough', ~383px wide) with placeholder text and showCount off, so the counter never appears in the capture and could not be compared. The frame's stage draws no Field label or hint even though its code tab wraps the textarea in Field, so the build's label/hint is not counted against it. The build's states capture carries no captions; it shows idle, filled, invalid, disabled, read-only and required, so hover, focus-visible (frame: 2px blue ring offset ~2px outside the border) and at limit (frame: red 2px ring like invalid) have no live counterpart. Box geometry otherwise matches: ~8px radius, ~16-18px inline padding, ~12px block padding, 14px body text, muted placeholder, raised surface, ~80px height at rows=3.
