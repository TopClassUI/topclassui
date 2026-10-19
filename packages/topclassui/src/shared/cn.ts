import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import { TONES } from './contracts/tone.js'

// Without these, h-control-md and h-control-sm would both survive a merge.
const twMerge = extendTailwindMerge<'tone'>({
  extend: {
    theme: {
      spacing: [
        'control-xs', 'control-sm', 'control-md', 'control-lg', 'control-xl',
        'toggle-xs', 'toggle-sm', 'toggle-md', 'toggle-lg', 'toggle-xl',
        'knob-xs', 'knob-sm', 'knob-md', 'knob-lg', 'knob-xl',
        'icon-xs', 'icon-sm', 'icon-md', 'icon-lg', 'icon-xl',
        'pad-x-xs', 'pad-x-sm', 'pad-x-md', 'pad-x-lg', 'pad-x-xl',
        'pad-y-xs', 'pad-y-sm', 'pad-y-md', 'pad-y-lg', 'pad-y-xl',
      ],
      radius: ['control', 'box', 'chip'],
    },
    // Its own group, or two tone-* classes both survive and stylesheet order decides.
    classGroups: { tone: [{ tone: [...TONES] }] },
  },
})

/** Merge class strings so the last one wins. The consumer's className is always passed last. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
