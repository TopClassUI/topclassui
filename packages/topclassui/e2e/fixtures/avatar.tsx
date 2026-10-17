// Loaded into a live page by e2e/avatar-fallback.spec.ts: images the spec serves itself, through page.route,
// slowly, broken or swapped. Mounted in a provider of the page's own direction, as the harness mounts a demo.
// Inline styles only: the stylesheet of a live page is compiled from src/, so a class written here alone would not exist.
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { AvatarFallback, AvatarImage, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '#components/avatar-group/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

/** Served by the spec: ok.svg paints, broken-N.png answers 404 when the spec lets it, slow.svg waits. */
const OK = '/__avatar/ok.svg'
const brokenOrOk = (index: number) => (index % 3 === 1 ? `/__avatar/broken-${String(index)}.png` : OK)

const INITIALS = ['OA', 'LH', 'SK', 'MN', 'RT'] as const
const FIFTY = Array.from({ length: 50 }, (_, index) => ({
  initials: INITIALS[index % INITIALS.length] ?? 'OA',
  name: `Member ${String(index + 1)}`,
  src: brokenOrOk(index),
}))

const SECTION: CSSProperties = { marginBlock: 24 }
const CELL: CSSProperties = { paddingInline: 8, paddingBlock: 4 }

declare global {
  interface Window { __avatarSrc?: (src: string) => void, __avatarSrcSet?: (srcSet: string) => void }
}

/** One avatar given by srcSet alone, with no src, which the spec changes from outside. */
function SrcSet() {
  const [srcSet, setSrcSet] = useState(`${OK} 1x`)
  useEffect(() => {
    window.__avatarSrcSet = setSrcSet
    return () => { delete window.__avatarSrcSet }
  }, [])
  return (
    <AvatarRoot id="srcset" size="xl">
      <AvatarImage srcSet={srcSet} alt="Omar Abed" />
      <AvatarFallback>OA</AvatarFallback>
    </AvatarRoot>
  )
}

/** One avatar whose src the spec changes from outside, as a list that reuses a row would. */
function Switch() {
  const [src, setSrc] = useState(OK)
  useEffect(() => {
    window.__avatarSrc = setSrc
    return () => { delete window.__avatarSrc }
  }, [])
  return (
    <AvatarRoot id="switch" size="xl">
      <AvatarImage src={src} alt="Omar Abed" />
      <AvatarFallback>OA</AvatarFallback>
    </AvatarRoot>
  )
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  // The spec waits for this: every image hook has mounted by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="avatar-fixture">
      <section style={SECTION}><Switch /></section>
      <section style={SECTION}><SrcSet /></section>
      <section style={SECTION}>
        <AvatarRoot id="slow" size="xl">
          <AvatarImage src="/__avatar/slow.svg" alt="Sara Khalil" />
          <AvatarFallback>SK</AvatarFallback>
        </AvatarRoot>
      </section>
      <section id="group" style={SECTION}>
        <AvatarGroup max={20} aria-label="Fifty people">
          {FIFTY.map(({ initials, name, src }) => (
            <AvatarRoot key={name}>
              <AvatarImage src={src} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </AvatarRoot>
          ))}
        </AvatarGroup>
      </section>
      <section id="table" style={SECTION}>
        <table>
          <tbody>
            {FIFTY.map(({ initials, name, src }) => (
              <tr key={name}>
                <td style={CELL}>
                  <AvatarRoot size="sm">
                    <AvatarImage src={src} alt="" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </AvatarRoot>
                </td>
                <td style={CELL}>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
createRoot(container).render(
  <TopClassProvider direction={direction} locale={document.documentElement.lang}><Fixture /></TopClassProvider>,
)
