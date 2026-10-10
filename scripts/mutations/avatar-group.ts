// The mutations of src/components/avatar-group. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'AvatarGroup max loses its clamp, so max={0} shows no avatar and max={500} shows every one',
    file: 'src/components/avatar-group/lib.ts',
    from: 'clamp(max, AVATAR_GROUP_BOUNDARIES.maxMin, AVATAR_GROUP_BOUNDARIES.maxMax)',
    to: 'max',
  },
  {
    label: 'the AvatarGroup counter ignores size, so +N stays md beside avatars of any other size',
    file: 'src/components/avatar-group/index.tsx',
    from: '<AvatarRoot size={size} role="img"',
    to: '<AvatarRoot role="img"',
  },
  {
    label: 'an AvatarGroup whose children all fit still ends in a +0 counter',
    file: 'src/components/avatar-group/index.tsx',
    from: 'const fmt = hidden > 0 ? createNumberFormat(locale) : undefined',
    to: 'const fmt = createNumberFormat(locale)',
  },
  {
    label: 'the AvatarGroup overlap becomes a physical margin, so the row no longer mirrors in rtl',
    file: 'src/components/avatar-group/classes.ts',
    from: "md: 'ps-2 *:-ms-2',",
    to: "md: 'ps-2 *:-ml-2',",
  },
  {
    label: 'the AvatarGroup ring loses the page colour, so it paints in the text colour of each avatar',
    file: 'src/components/avatar-group/classes.ts',
    from: "'*:ring-2 *:ring-page'",
    to: "'*:ring-2'",
  },
  {
    label: 'the AvatarGroup counter is named from the English labels whatever the labels prop says',
    file: 'src/components/avatar-group/index.tsx',
    from: 'aria-label={labels.avatar.more(hidden, fmt)}',
    to: 'aria-label={en.avatar.more(hidden, fmt)}',
  },
  {
    label: 'AvatarGroup no longer wraps, so twenty avatars push a phone page sideways instead of taking a second row',
    file: 'src/components/avatar-group/classes.ts',
    from: "'inline-flex max-w-full shrink-0 flex-wrap items-center gap-y-1'",
    to: "'inline-flex max-w-full shrink-0 items-center gap-y-1'",
  },
  {
    label: 'AvatarGroup may be wider than its container again, because nothing caps its width',
    file: 'src/components/avatar-group/classes.ts',
    from: "'inline-flex max-w-full shrink-0",
    to: "'inline-flex shrink-0",
  },
  {
    label: 'AvatarGroup shrinks in a flex row, so the faces wrap into a column while the text beside them could still give way',
    file: 'src/components/avatar-group/classes.ts',
    from: 'max-w-full shrink-0 flex-wrap',
    to: 'max-w-full flex-wrap',
  },
  {
    label: 'the AvatarGroup root loses its padding at md, so the first avatar of every row sits a step outside the box',
    file: 'src/components/avatar-group/classes.ts',
    from: "md: 'ps-2 *:-ms-2',",
    to: "md: '*:-ms-2',",
  },
  {
    label: 'the AvatarGroup overlap at xs is a whole step again, which hid a quarter of the initials under the next avatar',
    file: 'src/components/avatar-group/classes.ts',
    from: "xs: 'ps-1 *:-ms-1',",
    to: "xs: 'ps-2 *:-ms-2',",
  },
  {
    label: 'the AvatarGroup overlap at sm is a whole step again, which hid a fifth of the initials under the next avatar',
    file: 'src/components/avatar-group/classes.ts',
    from: "sm: 'ps-1 *:-ms-1',",
    to: "sm: 'ps-2 *:-ms-2',",
  },
  {
    label: 'the AvatarGroup counter is a fixed circle again, so +12,345 is cut to 12,34',
    file: 'src/components/avatar-group/index.tsx',
    from: ' className={GROUP_COUNTER[size]}',
    to: '',
  },
  {
    label: 'the AvatarGroup counter keeps the fixed width of the avatar at md, so its floor and its padding widen nothing',
    file: 'src/components/avatar-group/classes.ts',
    from: "md: 'w-auto min-w-control-md px-1',",
    to: "md: 'min-w-control-md px-1',",
  },
  {
    label: 'the AvatarGroup custom size widens the counter too, so one class on the group can no longer size it',
    file: 'src/components/avatar-group/classes.ts',
    from: "  custom: '',",
    to: "  custom: 'w-auto px-1',",
  },
  {
    label: 'the AvatarGroup ring is square around a link again, because only an avatar is a circle',
    file: 'src/components/avatar-group/classes.ts',
    from: "'*:rounded-full *:isolate",
    to: "'*:isolate",
  },
  {
    label: 'AvatarGroup children are no longer isolated, so an avatar paints over the ring of the link after it',
    file: 'src/components/avatar-group/classes.ts',
    from: '*:rounded-full *:isolate *:focus-visible:z-1',
    to: '*:rounded-full *:focus-visible:z-1',
  },
  {
    label: 'a focused child of AvatarGroup stays under the next avatar, which hides a third of its focus ring',
    file: 'src/components/avatar-group/classes.ts',
    from: " *:focus-visible:z-1'",
    to: "'",
  },
]
