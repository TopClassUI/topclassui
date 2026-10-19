# spinner: Figma frame vs live build

Verdict: **matches**. Blockers 0, major 0, minor 0.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|

Notes: Sample content differs (not counted): the Figma stage draws four spinners in a row (sm/md/lg/xl = 16/20/26/32 px) centred on the stage; the live playground draws one md spinner (20 px) at the top-left. Measured pixel-for-pixel: states-strip sizes xs 13 / sm 16 / md 20 / lg 26 / xl 32 px in Figma vs 14 / 16 / 20 / 26 / 34 px live (antialiasing); stroke 2.7-4.4 px vs 2.8-4.0 px at half-max; both use round caps; arc ~300 deg (gap ~45 deg) vs ~320 deg (gap ~40 deg), inside the error of a half-max threshold on a 2-3 px antialiased stroke; primary colour #51A2FF identical. The gap sits at the top in Figma and at the left in the capture only because the live one is mid-rotation. The build draws more than the frame: six tones (primary, neutral, success, warning, danger, info) and a 'Decorative, in the text colour' currentColor row; the frame strip draws only the five sizes, all primary. The frame's Try-it panel (chrome, not compared) still lists label / centered / overlay toggles; the strip never draws them, and packages/topclassui/src/components/spinner/test/spinner.types.test.ts asserts those props do not exist, so the panel is stale against a code decision rather than the build missing a state.
