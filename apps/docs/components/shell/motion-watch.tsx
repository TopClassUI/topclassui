'use client'

import { useEffect } from 'react'

import { armMotion } from '../../lib/motion'

/** Renders nothing: arms the page's scroll-in motion once it has hydrated, and lets go on the way out. */
export function MotionWatch() {
  useEffect(() => armMotion(document), [])
  return null
}
