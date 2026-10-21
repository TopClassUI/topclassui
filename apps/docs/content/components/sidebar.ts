// The hand-written data of the Sidebar page and card (docs-site S7), in en and ar; `x` in a string is inline code.
export const sidebar = {
  slug: 'sidebar',
  title: {
    en: 'Sidebar',
    ar: 'الشريط الجانبي',
  },
  description: {
    en: 'A rail of server-rendered links that collapses to a column of icons. Only the rail and its toggle run in the browser.',
    ar: 'شريط جانبي روابطه تُعرض على الخادم، وينطوي إلى عمود من الأيقونات. الشريط وزرّه وحدهما يعملان في المتصفح.',
  },
  demos: ['basic', 'groups', 'collapsed', 'controlled', 'in-a-layout', 'long-list', 'rtl'],
  stageHeight: 25,
  controlOrder: ['defaultOpen'],
  controlsHidden: ['open'],
  note: {
    en: '`defaultOpen={false}` sends the rail collapsed in the server HTML, so nothing moves when the page hydrates.',
    ar: 'مع `defaultOpen={false}` يرسل الخادم الشريط مطويًّا، فلا يتحرك شيء عند الترطيب.',
  },
  notes: {
    en: [
      'Six flat parts and no bare `Sidebar`. `SidebarRoot` and `SidebarTrigger` run in the browser; `SidebarHeader`, `SidebarBody`, `SidebarGroup` and `SidebarLink` are server HTML. `SidebarHeader` draws the toggle itself.',
      'Give the parent of the rail a height, such as `h-dvh`. A long list then scrolls inside `SidebarBody`, and the page does not.',
      'In a flex row the rail keeps its 220 px, or 60 collapsed. Give the column beside it `min-w-0 flex-1`.',
      'A link takes `href`, or `render={<Link href="/docs" />}` in Next.js. Every other prop goes to the link, not to the list item around it.',
      'Give every link an `icon` when the rail can collapse: collapsed, the icon is all that is drawn.',
      '`open` with `onOpenChange` needs a `\'use client\'` file, as the controlled example shows. A button outside the rail can then toggle it.',
      'Another width: `className="data-open:w-72"` on `SidebarRoot`; the collapsed width stays. On a phone, start it collapsed: the drawer form is not built yet.',
    ],
    ar: [
      'ستة أجزاء بأسماء مسطّحة، ولا يوجد `Sidebar` وحده. `SidebarRoot` و`SidebarTrigger` يعملان في المتصفح، و`SidebarHeader` و`SidebarBody` و`SidebarGroup` و`SidebarLink` HTML من الخادم. `SidebarHeader` يرسم زر الطي بنفسه.',
      'أعطِ العنصر الأب للشريط ارتفاعًا، مثل `h-dvh`. عندها تمرّر القائمة الطويلة داخل `SidebarBody`، ولا تتحرك الصفحة.',
      'في صف flex يحافظ الشريط على عرضه 220 px، أو 60 وهو مطوي. أعطِ العمود المجاور له `min-w-0 flex-1`.',
      'الرابط يأخذ `href`، أو `render={<Link href="/docs" />}` في Next.js. كل خاصية أخرى تذهب إلى الرابط، لا إلى عنصر القائمة حوله.',
      'أعطِ كل رابط `icon` إن كان الشريط ينطوي: وهو مطوي، الأيقونة هي كل ما يُرسم.',
      '`open` مع `onOpenChange` يحتاجان ملفًا فيه `\'use client\'`، كما في المثال المتحكَّم به. عندها يستطيع زر خارج الشريط أن يطويه.',
      'لعرض آخر: `className="data-open:w-72"` على `SidebarRoot`، ويبقى عرض الشريط المطوي كما هو. على الهاتف ابدأ به مطويًّا: صيغة الدرج لم تُبنَ بعد.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves to the toggle, then to each link.', ar: 'ينتقل إلى زر الطي، ثم إلى كل رابط.' } },
    { keys: ['Enter'], action: { en: 'On the toggle, expands or collapses the rail; on a link, follows it.', ar: 'على زر الطي يوسّع الشريط أو يطويه، وعلى رابط يتبعه.' } },
    { keys: ['Space'], action: { en: 'On the toggle, expands or collapses the rail.', ar: 'على زر الطي يوسّع الشريط أو يطويه.' } },
  ],
  accessibility: {
    en: [
      'The toggle is a real button with `aria-expanded`, named by what a press will do: "Collapse the sidebar" or "Expand the sidebar".',
      '`current` on one `SidebarLink` sets `aria-current="page"` and draws the row filled, bold and with a bar at its start.',
      'Collapsed, the title, the label of each group and the label of each link are hidden on screen, and a screen reader still reads them.',
    ],
    ar: [
      'زر الطي زر حقيقي عليه `aria-expanded`، واسمه ما ستفعله الضغطة: «طي الشريط الجانبي» أو «توسيع الشريط الجانبي».',
      '`current` على رابط `SidebarLink` واحد يضع `aria-current="page"` ويرسم الصف معبّأً وعريض الخط وبشريط عند بدايته.',
      'وهو مطوي، يختفي العنوان واسم كل مجموعة وتسمية كل رابط عن الشاشة، ويبقى قارئ الشاشة يقرؤها.',
    ],
  },
  rtl: {
    en: 'Under dir="rtl" the rail\'s line is on its left and the toggle on its right, with its icon mirrored. TopClassProvider with locale="ar" names both in Arabic.',
    ar: 'مع dir="rtl" يكون خط الشريط على يساره وزر الطي على يمينه، وأيقونته معكوسة. `TopClassProvider` مع locale="ar" يسمّي الاثنين بالعربية.',
  },
  related: {
    components: ['navbar', 'breadcrumb', 'tabs', 'drawer'],
    pages: ['server-first', 'rtl', 'icons'],
  },
} as const
