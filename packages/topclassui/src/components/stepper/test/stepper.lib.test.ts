import { describe, expect, it } from 'vitest'

import { statusOf } from '../lib.js'
import type { StepperItem } from '../types.js'

const steps = (...ids: string[]): StepperItem[] => ids.map((id) => ({ id, title: id }))

describe('statusOf', () => {
  it('marks the steps before value done, value current and the rest todo', () => {
    expect(statusOf(steps('a', 'b', 'c', 'd'), 'b')).toEqual(['done', 'current', 'todo', 'todo'])
    expect(statusOf(steps('a', 'b', 'c'), 'a')).toEqual(['current', 'todo', 'todo'])
    expect(statusOf(steps('a', 'b', 'c'), 'c')).toEqual(['done', 'done', 'current'])
  })

  it('leaves every step todo when value names none, or is not given', () => {
    expect(statusOf(steps('a', 'b'), 'z')).toEqual(['todo', 'todo'])
    expect(statusOf(steps('a', 'b'), undefined)).toEqual(['todo', 'todo'])
  })

  it('lets a step\'s own status win, before, on and after value', () => {
    const items: StepperItem[] = [
      { id: 'a', title: 'a', status: 'error' },
      { id: 'b', title: 'b', status: 'todo' },
      { id: 'c', title: 'c', status: 'done' },
    ]
    expect(statusOf(items, 'b')).toEqual(['error', 'todo', 'done'])
  })

  it('ignores a status no list holds, an Object.prototype name included', () => {
    const stray = [
      { id: 'a', title: 'a', status: 'toString' },
      { id: 'b', title: 'b', status: 'skipped' },
      { id: 'c', title: 'c' },
    ] as unknown as StepperItem[]
    expect(statusOf(stray, 'b')).toEqual(['done', 'current', 'todo'])
  })

  it('takes the first step of two with one id, as the one value names', () => {
    expect(statusOf(steps('a', 'b', 'b', 'c'), 'b')).toEqual(['done', 'current', 'todo', 'todo'])
  })

  it('returns nothing for no steps', () => {
    expect(statusOf([], 'a')).toEqual([])
  })
})
