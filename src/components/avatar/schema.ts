// R-8.3-1: zod lives here only, and components import this file with `import type`.
import { z } from 'zod'

import { sizeSchema } from '#shared/contracts/size.schema.js'
import { AVATAR_DEFAULTS } from './constants.js'

// R-8.3-3: .meta() is last in each chain, or zod drops it from the JSON Schema output.
export const avatarSchema = z.object({
  size: sizeSchema.default(AVATAR_DEFAULTS.size)
    .meta({ description: 'The control scale on both axes, so an avatar lines up with a button of the same size; custom emits no size classes.' }),
})

export type AvatarSchemaInput = z.input<typeof avatarSchema>
