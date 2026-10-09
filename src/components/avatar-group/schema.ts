// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { AVATAR_GROUP_BOUNDARIES } from './boundaries.js'
import { AVATAR_GROUP_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const avatarGroupSchema = z.object({
  max: z.number().int().min(AVATAR_GROUP_BOUNDARIES.maxMin).max(AVATAR_GROUP_BOUNDARIES.maxMax)
    .default(AVATAR_GROUP_DEFAULTS.max)
    .meta({ description: 'How many children show before the +N counter takes the rest; clamped to 1-20.' }),
  size: sizeSchema.default(AVATAR_GROUP_DEFAULTS.size)
    .meta({ description: 'The size of the +N counter; pass the size the avatars carry. custom emits none.' }),
})

export type AvatarGroupSchemaInput = z.input<typeof avatarGroupSchema>
