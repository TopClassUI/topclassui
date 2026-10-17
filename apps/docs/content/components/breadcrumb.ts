// The hand-written data of the Breadcrumb page and card (docs-site S7), in en and ar; `x` in a string is inline code.
export const breadcrumb = {
  slug: 'breadcrumb',
  title: {
    en: 'Breadcrumb',
    ar: 'مسار التنقل',
  },
  description: {
    en: 'Where a page sits in the site, as real links with no JavaScript. The same trail is written as BreadcrumbList JSON-LD.',
    ar: 'موقع الصفحة في الموقع، بروابط حقيقية ودون JavaScript. والمسار نفسه يُكتب BreadcrumbList بصيغة JSON-LD.',
  },
  demos: ['basic', 'all-links', 'long-trail', 'long-label', 'mixed-label', 'deep-trail', 'rtl'],
  stageHeight: 3,
  stageDemo: 'basic',
  note: {
    en: 'Leave href off the last item: it becomes the current page, and the linked items also emit the BreadcrumbList JSON-LD.',
    ar: 'اترك href عن العنصر الأخير ليصبح الصفحة الحالية. العناصر ذات الروابط تُكتب أيضًا في BreadcrumbList بصيغة JSON-LD.',
  },
  notes: {
    en: [
      '`items` is the trail as `{ href?, label }`, root first. With an `href` on the last item too, it is one more link and no page is marked current.',
      'In Next.js a plain link reloads the page. Pass `link={<Link href="" />}` and each crumb is a client navigation; its href is replaced with the item\'s.',
      'Pass `baseUrl="https://example.com"` and the JSON-LD lists absolute URLs. The links stay as written.',
      'A crumb with an empty label, or one that is not a string, is left out of the trail and of the JSON-LD.',
      'A crumb without an `href` that is not the last one is plain text: no link, and no entry in the JSON-LD.',
      'A long label ends in an ellipsis at the width of its box and is cut at 200 characters. The JSON-LD keeps the whole label.',
    ],
    ar: [
      '`items` هو المسار بصيغة `{ href?, label }`، يبدأ من الجذر. إن كان على العنصر الأخير `href` أيضًا فهو رابط آخر، ولا تُعلَّم أي صفحة بأنها الحالية.',
      'في Next.js يعيد الرابط العادي تحميل الصفحة. مرّر `link={<Link href="" />}` فيصبح كل عنصر تنقّلًا من جهة المتصفح، ويُستبدل href فيه بعنوان العنصر.',
      'مرّر `baseUrl="https://example.com"` فتصبح عناوين JSON-LD مطلقة. الروابط نفسها تبقى كما كُتبت.',
      'العنصر الذي تسميته فارغة، أو ليست نصًّا، يُستبعد من المسار ومن JSON-LD.',
      'العنصر الذي لا `href` له وليس الأخير نص عادي: لا رابط، ولا مدخل في JSON-LD.',
      'التسمية الطويلة تنتهي بعلامة حذف عند عرض صندوقه ويُقصّ عند 200 حرف. أما JSON-LD فيحتفظ بالتسمية كاملة.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves to the next crumb link. The current page is text, not a tab stop.', ar: 'ينتقل إلى رابط العنصر التالي. الصفحة الحالية نص وليست محطة Tab.' } },
    { keys: ['Enter'], action: { en: 'Follows the focused link.', ar: 'يتبع الرابط الذي عليه التركيز.' } },
  ],
  accessibility: {
    en: [
      'The trail is an ordered list inside a nav named "Breadcrumb" from `labels.breadcrumb.label`. `aria-label` renames it; an empty one falls back to the built-in name.',
      'The last crumb carries `aria-current="page"` and a heavier weight, so colour is not the only cue.',
      'The carets between crumbs are decorative and hidden from a screen reader.',
    ],
    ar: [
      'المسار قائمة مرتّبة داخل عنصر nav اسمه من `labels.breadcrumb.label`. `aria-label` يغيّر الاسم، والفارغ منه يعود إلى الاسم المدمج.',
      'العنصر الأخير عليه `aria-current="page"` وخط أثقل، فلا يكون اللون هو الدليل الوحيد.',
      'الأسهم بين العناصر زخرفية ومخفية عن قارئ الشاشة.',
    ],
  },
  rtl: {
    en: 'Under dir="rtl" the trail runs from the right and each caret flips to point along it. `labels={getLabels(\'ar\').labels}` names the nav in Arabic.',
    ar: 'مع dir="rtl" يبدأ المسار من اليمين وينقلب كل سهم ليشير على امتداده. `labels={getLabels(\'ar\').labels}` يسمّي عنصر nav بالعربية.',
  },
  related: {
    components: ['pagination', 'navbar', 'sidebar'],
    pages: ['server-first', 'rtl', 'accessibility'],
  },
} as const
