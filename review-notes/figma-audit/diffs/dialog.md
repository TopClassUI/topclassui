# dialog: Figma frame vs live build

Verdict: **major**. Blockers 0, major 2, minor 5.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| footer buttons: size | 28 px tall, ~12 px horizontal padding (Cancel 60x28, Delete 62x28); footer sits 16 px above the popup bottom | 40 px tall md controls, ~18 px padding (Cancel 76x40, Publish now 112x40, Done 68x40); same 16 px bottom padding | Render footer actions at the sm control size (DialogFooter sets size='sm' on its buttons, or the demo does), or redraw the frame at 40 px and record the choice in DECISIONS.md | major |
| footer buttons: secondary variant | Cancel is a filled neutral button: #171717 fill (darker than the #262626 surface), white #FAFAFA text, no border | Cancel is the outline variant: transparent fill, 1 px line border, primary-blue text | Use a neutral solid/soft variant for the close action in the dialog sample (add it to Button if it does not exist); keep outline only if the frame is changed | major |
| popup width | 380 px wide (x 166-545) | 400 px wide (x 273-672) | Set the md popup width knob to 380 px | minor |
| popup radius | ~8 px corner radius | ~12 px corner radius | Use the 8 px step of the radius knob on DialogPopup | minor |
| close button placement | 12 px X glyph, muted (#828282), right edge 20 px from the popup edge, centred on the title line | 12 px X glyph, muted (#979797), right edge 28 px from the popup edge because it sits inside a larger hit box | Offset the close button by its own padding (negative margin-inline-end) so the glyph lands on the 20 px padding line while the 24 px hit box stays | minor |
| backdrop | stage behind the popup stays #0A0A0A with the dimmed content still readable (#121212) | page dims to #030303; the trigger buttons behind are barely legible | Lighten the backdrop opacity so content behind stays faintly readable like the frame | minor |
| closed state: trigger | 'Open' is a 53x30 neutral button: #171717 fill, white text, 1 px #262626 border | 'Open' is a 69x40 outline button with primary-blue text | Use the same neutral sm button for the triggers in the states demo | minor |

Missing states: alert (trigger exists, not captured), scrolled (trigger exists, not captured), focus trapped (trigger exists, not captured; frame draws a 2 px #51A2FF ring offset 2 px around the popup)

Notes: Sample content differs: the frame shows a destructive confirm (title 'Delete this project?', no description, red Delete) while the build shows 'Publish changes' with a description line under the title, a body line and a primary 'Publish now'; the red-vs-blue primary action and the extra description line are not counted. Surface (#262626), 20 px padding, no border, soft shadow, title weight/size (~18 px semibold) and muted body text match. The build adds a 'Non-modal' state the frame does not draw. The states capture shows only the Open dialog, so alert, scrolled and focus-trapped could not be compared.
