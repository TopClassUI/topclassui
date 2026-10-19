# stepper: Figma frame vs live build

Verdict: **major**. Blockers 0, major 3, minor 3.

| Area | Figma frame | Built | Fix | Severity |
|---|---|---|---|---|
| layout / connector length | Stepper hugs its content: each step column is only as wide as its label, every connector is a fixed ~52px, the whole 4-step sample is ~310px wide and centred inside a 690px stage | Stepper fills the 960px container: connectors are flex-1 (~188px each) and step centres sit a uniform 220px apart | Default to intrinsic width (inline-flex root, connector at a fixed width from a knob or shared/classes, ~52px) and make the stretch an opt-in fullWidth prop | major |
| done connector colour | The completed connector (done -> current) is solid primary, rgb(21,93,252), same as the circle fill | The completed connector is primary at ~50% opacity, rgb(15,51,131), visibly dim against the solid circles | Paint the done connector with bg-primary-solid at full opacity; drop the opacity/tint modifier | major |
| states: disabled | The strip draws a disabled step: todo ring and number dimmed to ~50% (ring rgb(57,57,57), number rgb(92,92,92) vs 161 for todo) | No disabled step anywhere in the states demo (only todo, current, done, error) | Add a disabled step to the states demo and dim the ring and number with data-disabled (opacity-50 on the indicator and label) | major |
| connector thickness | Connectors are 1px tall | Connectors are 2px tall (rows y=47 and y=48) | Use the 1px border/line knob (h-px) for the connector | minor |
| idle connector colour | Idle connector grey is rgb(38,38,38) (reads as line-strong on the 10,10,10 background) | Idle connector is rgb(24,24,24), one step darker and barely visible | Use the line-strong role for the idle connector | minor |
| done label weight | Done step label ('Account') is regular weight in body colour; only the current label ('Profile') is bold | Done label is semibold, identical to the current label | Apply font-semibold only on data-current; done keeps text-body at normal weight | minor |

Missing states: disabled

Notes: Basic demo uses the same Account/Profile/Team/Done sample as the Figma stage. The states demo uses different content (Cart/Address/Payment as four full 3-step steppers) while the Figma strip draws five isolated 32px circles with the state name under each; not counted. Matches: 32px circles, 1px ring on todo in muted colour over a raised fill (23,23,23), solid primary current with white bold number, solid primary done with white tick, solid red error with white X, muted todo labels, ~10px circle-to-label gap. Font-family ignored per instructions.
