// The hand-written data of the Navbar page (docs-site S7), in English and Arabic.
export const content = {
  slug: 'navbar',
  demos: ['basic', 'with-search', 'many-links', 'not-sticky', 'rtl'],
  stageHeight: 6,
  related: ['sidebar', 'breadcrumb', 'tabs', 'button', 'input'],
  en: {
    title: 'Navbar',
    description: 'A sticky header whose links are server HTML. One small client part publishes its height as --tc-sticky-top.',
    note: 'The bar writes its own height to --tc-sticky-top, so an #anchor target stops below it, not under it.',
    notes: [
      'Five flat parts and no bare `Navbar`: `NavbarRoot` (a header), `NavbarBrand`, `NavbarLinks` (a nav), `NavbarLink` and `NavbarActions`.',
      'In Next.js, pass the framework link as `render={<Link href="/docs" />}` on `NavbarBrand` or `NavbarLink`. An element only, never a function.',
      '`sticky={false}` lets the bar scroll away with the page, and then it sends no JavaScript to the browser.',
      'Without script the variable stays 0px. Set `:root { --tc-sticky-top: 3.75rem }` in your CSS for one row; the bar replaces it with the measured value.',
      'One sticky bar a page: two would write the same variable, so give the second one `sticky={false}`.',
      'A page that scrolls inside a box of your own needs `scroll-padding-top: var(--tc-sticky-top)` on that box.',
      'On a narrow screen the links scroll sideways inside the bar and the actions drop to a second row. The page never scrolls sideways.',
    ],
    a11y: [
      '`current` on one `NavbarLink` sets `aria-current="page"`. The link is heavier as well as darker, and underlined under forced colours.',
      '`NavbarLinks` is a nav landmark named "Main" from `labels.navbar.label`. With two on a page, give one an `aria-label`: yours wins.',
      'The link that has the keyboard focus is brought whole into view inside the scrolling list.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves to the brand, each link, then each action, in reading order.' },
      { keys: 'Shift + Tab', action: 'Moves back.' },
      { keys: 'Enter', action: 'Follows the focused link.' },
    ],
    rtl: 'Under dir="rtl" the brand sits at the right and the actions at the left. Pass `labels={ar}` to `NavbarLinks` for the Arabic name.',
  },
  ar: {
    title: 'شريط التنقّل',
    description: 'ترويسة مثبّتة روابطها HTML من الخادم، ويكتب جزء صغير واحد في المتصفح ارتفاعها في --tc-sticky-top.',
    note: 'يكتب الشريط ارتفاعه في --tc-sticky-top، فيتوقف هدف الرابط #anchor تحته لا خلفه.',
    notes: [
      'خمسة أجزاء بأسماء مسطّحة، ولا يوجد `Navbar` وحده: `NavbarRoot` (عنصر header) و`NavbarBrand` و`NavbarLinks` (عنصر nav) و`NavbarLink` و`NavbarActions`.',
      'في Next.js مرّر رابط الإطار عبر `render={<Link href="/docs" />}` على `NavbarBrand` أو `NavbarLink`. عنصرًا فقط، لا دالة.',
      'مع `sticky={false}` يمرّ الشريط مع الصفحة، ولا يرسل حينها أي JavaScript إلى المتصفح.',
      'دون سكربت يبقى المتغير 0px. اكتب `:root { --tc-sticky-top: 3.75rem }` في CSS لصف واحد، ويستبدله الشريط بالقيمة المقيسة.',
      'شريط مثبّت واحد في الصفحة: شريطان يكتبان المتغير نفسه، فأعطِ الثاني `sticky={false}`.',
      'الصفحة التي تمرّر داخل صندوق من صنعك تحتاج `scroll-padding-top: var(--tc-sticky-top)` على ذلك الصندوق.',
      'على الشاشة الضيقة تمرّر الروابط أفقيًا داخل الشريط، وتنزل الإجراءات إلى صف ثانٍ. الصفحة نفسها لا تمرّر أفقيًا أبدًا.',
    ],
    a11y: [
      '`current` على رابط `NavbarLink` واحد يضع `aria-current="page"`. يصبح الرابط أثقل وأغمق معًا، وتحته خط في وضع الألوان القسرية.',
      '`NavbarLinks` معلم تنقّل اسمه «التنقل الرئيسي» من `labels.navbar.label`. إن وُجد اثنان في الصفحة فأعطِ أحدهما `aria-label`، واسمك هو الغالب.',
      'الرابط الذي عليه تركيز لوحة المفاتيح يظهر كاملًا داخل القائمة التي تمرّر.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'ينتقل إلى الشعار، ثم كل رابط، ثم كل إجراء، بترتيب القراءة.' },
      { keys: 'Shift + Tab', action: 'يعود إلى الخلف.' },
      { keys: 'Enter', action: 'يتبع الرابط الذي عليه التركيز.' },
    ],
    rtl: 'مع dir="rtl" يجلس الشعار على اليمين والإجراءات على اليسار. مرّر `labels={ar}` إلى `NavbarLinks` ليأخذ اسمه بالعربية.',
  },
} as const
