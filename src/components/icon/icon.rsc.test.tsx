// The rsc project, where `server-only` resolves to an empty module.
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { arrowLeft } from '../../icons/data/arrow-left.js'
import { check } from '../../icons/data/check.js'
import { Svg, type SvgProps } from '../svg/index.js'
import { Icon, type IconProps } from './index.js'
import { loadIcon } from './lib.js'

/** The element `<Icon>` returns, which is a `<Svg>` and nothing else. */
async function resolve(props: IconProps): Promise<ReactElement<SvgProps>> {
  return (await Icon(props)) as ReactElement<SvgProps>
}

describe('loadIcon', () => {
  it('loads the icon the name asks for', async () => {
    await expect(loadIcon('arrow-left')).resolves.toEqual(arrowLeft)
  })

  it('returns the cached object on a second call, so a shared icon loads once', async () => {
    const first = await loadIcon('check')
    expect(await loadIcon('check')).toBe(first)
  })

  it('loads every name in the set', async () => {
    const { ICON_NAMES } = await import('../../icons/names.generated.js')
    const all = await Promise.all(ICON_NAMES.map((n) => loadIcon(n)))
    expect(all).toHaveLength(84)
    expect(all.every((i) => i.path.length > 0 && i.viewBox === '0 0 256 256')).toBe(true)
  })
})

describe('<Icon>', () => {
  it('renders through <Svg>, so the server and browser twins cannot drift', async () => {
    const el = await resolve({ name: 'arrow-left' })
    expect(el.type).toBe(Svg)
    expect(el.props.icon).toEqual(arrowLeft)
  })

  it('passes every other prop through untouched', async () => {
    const el = await resolve({ name: 'check', size: 'lg', label: 'Done', className: 'text-muted' })
    expect(el.props).toMatchObject({ icon: check, size: 'lg', label: 'Done', className: 'text-muted' })
  })

  it('resolves a different name to a different path', async () => {
    const a = await resolve({ name: 'arrow-left' })
    const b = await resolve({ name: 'check' })
    expect(a.props.icon.path).not.toBe(b.props.icon.path)
  })
})
