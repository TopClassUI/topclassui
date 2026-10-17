// The hand-written data of the Sidebar page (docs-site S7), in English and Arabic.
export const content = {
  slug: 'sidebar',
  demos: ['basic', 'groups', 'collapsed', 'controlled', 'in-a-layout', 'rtl'],
  stageHeight: 25,
  related: ['navbar', 'breadcrumb', 'tabs', 'drawer', 'icon'],
  en: {
    title: 'Sidebar',
    description: 'A rail of server-rendered links that collapses to a column of icons. Only the rail and its toggle run in the browser.',
    note: '`defaultOpen={false}` sends the rail collapsed in the server HTML, so nothing moves when the page hydrates.',
    notes: [
      'Six flat parts and no bare `Sidebar`. `SidebarRoot` and `SidebarTrigger` run in the browser; `SidebarHeader`, `SidebarBody`, `SidebarGroup` and `SidebarLink` are server HTML. `SidebarHeader` draws the toggle itself.',
      'Give the parent of the rail a height, such as `h-dvh`. A long list then scrolls inside `SidebarBody`, and the page does not.',
      'In a flex row the rail keeps its 220 px, or 60 collapsed. Give the column beside it `min-w-0 flex-1`.',
      'A link takes `href`, or `render={<Link href="/docs" />}` in Next.js. Every other prop goes to the link, not to the list item around it.',
      'Give every link an `icon` when the rail can collapse: collapsed, the icon is all that is drawn.',
      '`open` with `onOpenChange` needs a `\'use client\'` file, as the controlled example shows. A button outside the rail can then toggle it.',
      'Another width: `className="data-open:w-72"` on `SidebarRoot`; the collapsed width stays. On a phone, start it collapsed: the drawer form is not built yet.',
    ],
    a11y: [
      'The toggle is a real button with `aria-expanded`, named by what a press will do: "Collapse the sidebar" or "Expand the sidebar".',
      '`current` on one `SidebarLink` sets `aria-current="page"` and draws the row filled, bold and with a bar at its start.',
      'Collapsed, the title, the label of each group and the label of each link are hidden on screen, and a screen reader still reads them.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves to the toggle, then to each link.' },
      { keys: 'Enter or Space', action: 'On the toggle: expands or collapses the rail.' },
      { keys: 'Enter', action: 'On a link: follows it.' },
    ],
    rtl: 'Under dir="rtl" the rail\'s line is on its left and the toggle on its right, with its icon mirrored. TopClassProvider with locale="ar" names both in Arabic.',
  },
  ar: {
    title: 'الشريط الجانبي',
    description: 'شريط جانبي روابطه تُعرض على الخادم، وينطوي إلى عمود من الأيقونات. الشريط وزرّه وحدهما يعملان في المتصفح.',
    note: 'مع `defaultOpen={false}` يرسل الخادم الشريط مطويًّا، فلا يتحرك شيء عند الترطيب.',
    notes: [
      'ستة أجزاء بأسماء مسطّحة، ولا يوجد `Sidebar` وحده. `SidebarRoot` و`SidebarTrigger` يعملان في المتصفح، و`SidebarHeader` و`SidebarBody` و`SidebarGroup` و`SidebarLink` HTML من الخادم. `SidebarHeader` يرسم زر الطي بنفسه.',
      'أعطِ العنصر الأب للشريط ارتفاعًا، مثل `h-dvh`. عندها تمرّر القائمة الطويلة داخل `SidebarBody`، ولا تتحرك الصفحة.',
      'في صف flex يحافظ الشريط على عرضه 220 px، أو 60 وهو مطوي. أعطِ العمود المجاور له `min-w-0 flex-1`.',
      'الرابط يأخذ `href`، أو `render={<Link href="/docs" />}` في Next.js. كل خاصية أخرى تذهب إلى الرابط، لا إلى عنصر القائمة حوله.',
      'أعطِ كل رابط `icon` إن كان الشريط ينطوي: وهو مطوي، الأيقونة هي كل ما يُرسم.',
      '`open` مع `onOpenChange` يحتاجان ملفًا فيه `\'use client\'`، كما في المثال المتحكَّم به. عندها يستطيع زر خارج الشريط أن يطويه.',
      'لعرض آخر: `className="data-open:w-72"` على `SidebarRoot`، ويبقى عرض الشريط المطوي كما هو. على الهاتف ابدأ به مطويًّا: صيغة الدرج لم تُبنَ بعد.',
    ],
    a11y: [
      'زر الطي زر حقيقي عليه `aria-expanded`، واسمه ما ستفعله الضغطة: «طي الشريط الجانبي» أو «توسيع الشريط الجانبي».',
      '`current` على رابط `SidebarLink` واحد يضع `aria-current="page"` ويرسم الصف معبّأً وعريض الخط وبشريط عند بدايته.',
      'وهو مطوي، يختفي العنوان واسم كل مجموعة واسم كل رابط عن الشاشة، ويبقى قارئ الشاشة يقرؤها.',
    ],
    keyboard: [
      { keys: 'Tab', action: 'ينتقل إلى زر الطي، ثم إلى كل رابط.' },
      { keys: 'Enter أو Space', action: 'على زر الطي: يوسّع الشريط أو يطويه.' },
      { keys: 'Enter', action: 'على رابط: يتبعه.' },
    ],
    rtl: 'مع dir="rtl" يكون خط الشريط على يساره وزر الطي على يمينه، وأيقونته معكوسة. `TopClassProvider` مع locale="ar" يسمّي الاثنين بالعربية.',
  },
} as const
