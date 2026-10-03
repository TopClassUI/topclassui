// R-8.3-1: the only file here that may load zod; components reference it as a type.
import { z } from 'zod'

import { SIZES } from './size.js'

export const sizeSchema = z.enum(SIZES)
