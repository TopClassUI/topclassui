// The mutations of src/components/rating. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'rating: the fill rule ignores the value, so every star is drawn full',
    file: 'src/components/rating/lib.tsx',
    from: "  if (value >= step) return 'full'\n  return value >= step - 0.5 ? 'half' : 'none'",
    to: "  return step > 0 ? 'full' : 'none'",
  },
  {
    label: 'rating: a read-only value is no longer rounded to the nearest half',
    file: 'src/components/rating/lib.tsx',
    from: 'return Math.round(clamp(value, 0, max) * 2) / 2',
    to: 'return clamp(value, 0, max)',
  },
  {
    label: 'rating: max is no longer clamped, so a thousand stars render',
    file: 'src/components/rating/lib.tsx',
    from: 'return Math.round(clamp(max, RATING_BOUNDARIES.maxMin, RATING_BOUNDARIES.maxMax))',
    to: 'return Math.round(max)',
  },
  {
    label: 'rating: the half clip starts at the physical left, so Arabic fills the wrong half',
    file: 'src/components/rating/classes.ts',
    from: 'absolute inset-y-0 inset-s-0 flex',
    to: 'absolute inset-y-0 left-0 flex',
  },
  {
    label: 'rating: the fill colour moves onto the svg, where forced colours do not reach it',
    file: 'src/components/rating/classes.ts',
    from: "export const RATING_FILL_ICON = 'max-w-none'",
    to: "export const RATING_FILL_ICON = 'max-w-none text-warning-on-soft'",
  },
  {
    label: 'rating: the radio is sr-only, a 1 px target',
    file: 'src/components/rating/classes.ts',
    from: "'absolute inset-0 size-full cursor-pointer appearance-none opacity-0'",
    to: "'sr-only'",
  },
  {
    label: 'rating: a step loses its target size, so an xs star is 16 px to press',
    file: 'src/components/rating/classes.ts',
    from: 'rounded-control ${TOUCH_TARGET} ${FOCUS_RING_WITHIN}',
    to: 'rounded-control ${FOCUS_RING_WITHIN}',
  },
  {
    label: 'rating: a step loses the ring of the radio it holds',
    file: 'src/components/rating/classes.ts',
    from: 'rounded-control ${TOUCH_TARGET} ${FOCUS_RING_WITHIN}',
    to: 'rounded-control ${TOUCH_TARGET}',
  },
  {
    label: 'rating: the row stops wrapping, so ten xl stars scroll a phone sideways',
    file: 'src/components/rating/classes.ts',
    from: '`inline-flex flex-wrap items-center gap-1',
    to: '`inline-flex items-center gap-1',
  },
  {
    label: 'rating: an unnamed rating gets no group name, so each radio is a group of its own',
    file: 'src/components/rating/hook.ts',
    from: 'name: name ?? own,',
    to: 'name,',
  },
  {
    label: 'rating: a form reset is no longer heard, so the stars and the radios disagree',
    file: 'src/components/rating/client.tsx',
    from: 'ref={index === 0 ? field.watchForm : undefined}',
    to: 'ref={undefined}',
  },
  {
    label: 'rating: leaving the row keeps the hover fill',
    file: 'src/components/rating/hook.ts',
    from: 'leave: (event: RatingRowLeave) => { setHovered(null); onPointerLeave?.(event) },',
    to: 'leave: (event: RatingRowLeave) => { onPointerLeave?.(event) },',
  },
  {
    label: 'rating: a disabled rating still fills on hover',
    file: 'src/components/rating/hook.ts',
    from: 'if (!disabled) setHovered(step)',
    to: 'setHovered(step)',
  },
  {
    label: 'rating: a filled star goes back to warning-solid, 2.13:1 on a white page',
    file: 'src/components/rating/classes.ts',
    from: 'flex overflow-hidden text-warning-on-soft',
    to: 'flex overflow-hidden text-warning-solid',
  },
  {
    label: 'rating: a change keeps the hover preview, so the arrows move the value but not the stars',
    file: 'src/components/rating/hook.ts',
    from: '=> { setHovered(null); setChecked(Number(event.currentTarget.value)) }',
    to: '=> { setChecked(Number(event.currentTarget.value)) }',
  },
  {
    label: 'rating: a read-only rating renders the client half, so a page of stars hydrates',
    file: 'src/components/rating/index.tsx',
    from: "return props.readOnly === false ? <Editable {...props} /> : <ReadOnly {...props} />",
    to: "return props.readOnly === true ? <ReadOnly {...props} /> : <Editable {...(props as RatingEditableProps)} aria-label=\"x\" readOnly={false} />",
  },
]
