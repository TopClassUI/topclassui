import { Button } from '#components/button/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

const SECTIONS = [
  { id: 'install', title: 'Install', next: 'usage' },
  { id: 'usage', title: 'Usage', next: 'theming' },
  { id: 'theming', title: 'Theming', next: 'questions' },
  { id: 'questions', title: 'Questions', next: 'install' },
] as const

/** A page longer than the screen under a sticky bar. Each link goes to a heading further
 * down, which stops below the bar and not under it; so does a link that Tab scrolls to. */
export default function Demo() {
  return (
    <div>
      <NavbarRoot>
        <NavbarBrand href="#install">Handbook</NavbarBrand>
        <NavbarLinks aria-label="On this page">
          {SECTIONS.map((section) => (
            <NavbarLink key={section.id} href={`#${section.id}`}>{section.title}</NavbarLink>
          ))}
        </NavbarLinks>
        <NavbarActions>
          <Button variant="outline" render={<a href="/handbook/edit" />}>Edit this page</Button>
        </NavbarActions>
      </NavbarRoot>
      {SECTIONS.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="min-h-dvh px-5 pb-6">
          <h2 id={section.id} className="text-base font-semibold text-body">{section.title}</h2>
          <Button variant="link" render={<a href={`#${section.next}`} />}>Go on to the next part</Button>
        </section>
      ))}
    </div>
  )
}
