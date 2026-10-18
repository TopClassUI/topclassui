import { describe, expect, it } from 'vitest'

import {
  actionDemoMapSource, clientDemoGroupSource, clientDemoMapSource, demoMapSource, parseDemoMap, playgroundMapSource, serverDemoMapSource,
} from './demo-map.js'

const demos = [{ slug: 'button', name: 'variants' }, { slug: 'segmented-control', name: 'rtl' }]

describe('demoMapSource', () => {
  it('writes one literal import per demo into dist, and the keys in the same order', () => {
    expect(demoMapSource(demos)).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const DEMOS = {',
      "  'button/variants': () => import('../../../packages/topclassui/dist/components/button/dummy/variants.js'),",
      "  'segmented-control/rtl': () => import('../../../packages/topclassui/dist/components/segmented-control/dummy/rtl.js'),",
      '} as const',
      '',
      'export const DEMO_KEYS = [',
      "  'button/variants',",
      "  'segmented-control/rtl',",
      '] as const',
      '',
      'export type DemoKey = (typeof DEMO_KEYS)[number]',
      '',
    ].join('\n'))
  })

  it('writes an empty map for no demos', () => {
    expect(parseDemoMap(demoMapSource([]))).toEqual([])
  })
})

describe('parseDemoMap', () => {
  it('reads back every key and file it wrote', () => {
    expect(parseDemoMap(demoMapSource(demos))).toEqual([
      { key: 'button/variants', file: '../../../packages/topclassui/dist/components/button/dummy/variants.js' },
      { key: 'segmented-control/rtl', file: '../../../packages/topclassui/dist/components/segmented-control/dummy/rtl.js' },
    ])
  })
})

describe('playgroundMapSource', () => {
  it('writes one literal import per playground stage, keyed by slug', () => {
    expect(playgroundMapSource(['button', 'tag'])).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const PLAYGROUNDS = {',
      "  'button': () => import('../../../packages/topclassui/dist/components/button/dummy/playground.js'),",
      "  'tag': () => import('../../../packages/topclassui/dist/components/tag/dummy/playground.js'),",
      '} as const',
      '',
      'export type PlaygroundSlug = keyof typeof PLAYGROUNDS',
      '',
    ].join('\n'))
  })
})

describe('the split demo maps', () => {
  const server = [{ slug: 'badge', name: 'tones' }]
  const client = [{ slug: 'dialog', name: 'basic' }, { slug: 'dialog', name: 'nested' }, { slug: 'tabs', name: 'rtl' }]
  const action = [{ slug: 'dropdown', name: 'data-driven' }]

  it('server-demos.ts loads only the server demos and lists the other keys as strings', () => {
    expect(serverDemoMapSource(server, client, action)).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const SERVER_DEMOS = {',
      "  'badge/tones': () => import('../../../packages/topclassui/dist/components/badge/dummy/tones.js'),",
      '} as const',
      '',
      'export const CLIENT_DEMO_KEYS: readonly string[] = [',
      "  'dialog/basic',",
      "  'dialog/nested',",
      "  'tabs/rtl',",
      ']',
      '',
      'export const ACTION_DEMO_KEYS: readonly string[] = [',
      "  'dropdown/data-driven',",
      ']',
      '',
    ].join('\n'))
  })

  it('client-demos.ts holds one loader per component', () => {
    expect(clientDemoMapSource(client)).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const CLIENT_DEMO_GROUPS = {',
      "  'dialog': () => import('./client-demos/dialog'),",
      "  'tabs': () => import('./client-demos/tabs'),",
      '} as const',
      '',
    ].join('\n'))
  })

  it('a group file holds one loader per demo, one folder deeper', () => {
    expect(clientDemoGroupSource(client.slice(0, 2))).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const DEMOS = {',
      "  'basic': () => import('../../../../packages/topclassui/dist/components/dialog/dummy/basic.js'),",
      "  'nested': () => import('../../../../packages/topclassui/dist/components/dialog/dummy/nested.js'),",
      '} as const',
      '',
    ].join('\n'))
  })

  it('action-demos.ts loads only the action demos', () => {
    expect(actionDemoMapSource(action)).toBe([
      '// Written by pnpm docs:data. Do not edit.',
      'export const ACTION_DEMOS = {',
      "  'dropdown/data-driven': () => import('../../../packages/topclassui/dist/components/dropdown/dummy/data-driven.js'),",
      '} as const',
      '',
    ].join('\n'))
  })
})
