# code-block: Figma frame vs live build

Verdict: **minor**. Blockers 0, major 1, minor 7.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| states strip | 5 states: idle, copy hover (copy icon darkens), copied (green success check replaces the copy icon), wrapped, no header | 3 states: Idle, Wrapped, No copy button; no copy hover, no copied (green check) drawn; 'No copy button' keeps the header and only drops the icon, which is not the frame's 'no header' | Add 'copy hover' and 'copied' (check icon in success tone) to the states demo, and draw a 'no header' state (no filename row); keep 'No copy button' only if the frame gains it | major |
| code type | Mono ~12px on an ~18px line pitch (lines at 235/253/271) | Mono ~13px on a 20px line pitch (lines at 77/97/117/137) | Drop the code body one size step and tighten the leading to the frame's ~18px pitch via the knobs | minor |
| header to code gap | ~24px from the filename row centre to the first code line centre | ~28px | Reduce the gap between the header row and the code body by ~4px | minor |
| bottom padding | ~10px below the last code line (centre at 271, card bottom 290) | ~14px below the last code line (centre at 137, card bottom 161) | Reduce the body's bottom padding by ~4px | minor |
| horizontal padding | ~12px from the card edge to the terminal icon and the code text | ~14px | Use the 12px inset the frame draws | minor |
| copy icon | ~14px, muted grey (same muted role as the filename) | ~12px, dark body colour | Render the copy icon at the frame's size in the muted text role; darken only on hover | minor |
| raised surface | Card reads as pure white on the dark stage | Card reads as off-white (~#f4f4f5) | Check the code-block surface token against the frame's white in dark mode | minor |
| highlighting | Stage sample code is uniformly dark text (no token colours) | Braces { } are tinted blue (Shiki), everything else dark | Likely a Figma simplification; confirm the intended Shiki theme for the light card, no change needed if highlighting is by design | minor |

Missing states: copy hover, copied, no header

Notes: Sample content differs (Figma: button.tsx with <Button variant=\"solid\" size=\"md\">; build: page.tsx with an async Page function) and is not counted. Radius (~8px), no border, no shadow, terminal icon, muted mono filename header and the copy icon placement all match. The Figma stage sample hugs ~418px centred on the stage while the build fills the 880px container; treated as stage layout, not a component difference. The Figma's own 'no header' thumbnail still draws the 'code' header and copy icon (identical to idle), so that state is ambiguous in the frame itself; copy hover and copied can only be fully verified in a browser, but the states demo should draw them. Font family ignored as instructed.
