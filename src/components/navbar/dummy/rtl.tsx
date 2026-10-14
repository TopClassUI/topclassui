import { Button } from '#components/button/index.js'
import { ar } from '#shared/labels/ar.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '../index.js'

/** Arabic: the brand sits at the right, the action at the left, and the nav takes its name
 * from the Arabic labels. No class of its own does it: every one is logical. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar">
      <NavbarRoot>
        <NavbarBrand href="/">توب كلاس</NavbarBrand>
        <NavbarLinks labels={ar}>
          <NavbarLink href="/docs" current>المستندات</NavbarLink>
          <NavbarLink href="/components">المكوّنات</NavbarLink>
          <NavbarLink href="/icons">الأيقونات</NavbarLink>
          <NavbarLink href="/theming">السمات</NavbarLink>
        </NavbarLinks>
        <NavbarActions>
          <Button render={<a href="/login" />}>تسجيل الدخول</Button>
        </NavbarActions>
      </NavbarRoot>
    </div>
  )
}
