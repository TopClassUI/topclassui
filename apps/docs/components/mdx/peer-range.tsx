import pkg from 'topclassui/package.json' with { type: 'json' }

import { INLINE_CODE } from '../classes'

export type PeerName = keyof typeof pkg.peerDependencies

/** A peer dependency's range, read from the package at build time, so the table cannot fall behind. */
export function PeerRange({ name }: { name: PeerName }) {
  return <code dir="ltr" className={INLINE_CODE}>{pkg.peerDependencies[name]}</code>
}
