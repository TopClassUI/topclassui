import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'], ['DF', 'Dana Fares'], ['HA', 'Hadi Aziz'],
  ['NS', 'Nour Salem'], ['KM', 'Karim Masri'], ['ZA', 'Zain Atallah'], ['TJ', 'Tala Jaber'],
  ['FE', 'Fadi Eid'],
] as const

/** Thirteen members: render every one, and the group shows four and counts nine. */
export default function Demo() {
  return (
    <AvatarGroup aria-label="Everyone on the project">
      {TEAM.map(([initials, name]) => (
        <AvatarRoot key={initials} role="img" aria-label={name}>
          <AvatarFallback>{initials}</AvatarFallback>
        </AvatarRoot>
      ))}
    </AvatarGroup>
  )
}
