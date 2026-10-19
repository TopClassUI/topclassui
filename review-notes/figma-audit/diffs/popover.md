# popover: Figma frame vs live build

Verdict: **major**. Blockers 0, major 4, minor 2.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| Trigger button (stage and states strip) | ghost sm button: raised-surface fill, no border, ~30px tall, body-colour text, 16px external-link icon before 'Share'; the five 'Open' triggers in the strip are the same ghost ~30px buttons | outline md button: ~38px tall, 1px line border, no icon; all five triggers in the states demo are the same outline ~38px style | Render the sample and states triggers with Button variant="ghost" size="sm" plus the leading icon, as the frame's code tab shows | major |
| Trigger open state | the open trigger is drawn identical to the closed one (raised fill, body text); no tint in the stage or in the 'open' state | the open trigger ('Share', 'Open') gets a primary tint background, a primary border and primary text | Remove the primary tint/border/text applied to the trigger while the popup is open, or make the open look match the ghost variant | major |
| Panel close control | muted ~16px X icon at the panel's top-right, on the title row (dismissible on in Try it) | no close control in the default sample; the states demo has a 'With close' trigger but its panel is not shown | Add PopoverClose with the x icon in the default sample so dismissible renders the close button at the title's end | major |
| States strip | five named states: closed, open (panel below), flipped (panel above the trigger), focus-visible (2px primary ring with ~2px offset on the trigger), dismissed (trigger with muted text); each labelled under it | triggers Open / Above / With close / Modal / On hover; only 'Open' shows its panel below; 'Above' is closed so no flipped panel; no trigger carries a focus ring; no muted dismissed trigger; no state names | Open the 'Above' popover in the states demo, add a focus-visible trigger and a dismissed (muted) trigger, and label each state | major |
| Panel title type | 'Share this page' ~15-16px semibold | 'Share this page' ~14px semibold | Set PopoverTitle to the next type step (~15px) semibold | minor |
| Popup action icon | 16px copy icon before 'Copy link' in the primary button | 'Copy link' button has no icon | Add the copy icon to the sample's Copy link button | minor |

Missing states: flipped, focus-visible, dismissed

Notes: Font-family ignored. Sample content differs in the states demo (frame draws a 'panel' placeholder; build shows a titled popup 'Open / Below its trigger, the default.') and is not counted. The built panel hugs the viewport's left edge (x=8) because the trigger sits at x=32 in a 960px capture, so centre alignment under the trigger cannot be judged from the live capture; the 8px side offset matches. Panel width (~280px), raised surface, ~10px radius, 16px padding, muted description and primary solid action all match. Neither side draws an arrow even though showArrow is checked in Try it. The build adds 'With close', 'Modal' and a link-style 'On hover' trigger that the frame does not draw.
