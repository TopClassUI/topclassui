// The meta description of each registry page, 120 to 160 characters in both languages; the lead under the h1 stays as drawn.
import type { PageSlug } from './pages'

interface Both {
  en: string
  ar: string
}

export const META_DESCRIPTIONS: Readonly<Record<Exclude<PageSlug, 'cli'>, Both>> = {
  home: {
    en: 'React components for Next.js, RTL-first and server-first. Most render on the server and add no JavaScript; all of them work in Arabic.',
    ar: 'مكوّنات React لـ Next.js، تبدأ من اليمين إلى اليسار وتُعرض على الخادم أولًا. أغلبها لا يضيف أي JavaScript، وكلها تعمل بالعربية.',
  },
  installation: {
    en: 'Install TopClass UI in two steps: add the package with your package manager, then add the components you need. Works with Next.js, Vite and React Router.',
    ar: 'ثبّت TopClass UI بخطوتين: أضف الحزمة بمدير الحزم الذي تستخدمه، ثم أضف المكوّنات التي تحتاج إليها. يعمل مع Next.js وVite وReact Router.',
  },
  css: {
    en: 'The whole Tailwind CSS v4 setup for TopClass UI: three import lines in a fixed order and no configuration file, with the utility names you get from them.',
    ar: 'إعداد Tailwind CSS v4 كاملًا لـ TopClass UI: ثلاثة أسطر استيراد بترتيب ثابت ولا ملف إعدادات، مع أسماء الأدوات التي تحصل عليها منها.',
  },
  provider: {
    en: 'One provider at the root of your app, with direction and locale as props. It is required, and everything it does is listed on this page.',
    ar: 'مزوّد واحد في جذر تطبيقك، يأخذ الاتجاه والإعداد المحلي كخصائص. وجوده إلزامي، وكل ما يفعله مذكور في هذه الصفحة، مع ThemeScript وتطبيقات الصفحة الواحدة.',
  },
  'first-component': {
    en: 'Build a form that renders on the server and posts to a Server Action, with no JavaScript for its markup, then show its errors without a page reload.',
    ar: 'ابنِ نموذجًا يُعرض على الخادم ويُرسل إلى إجراء خادم، دون JavaScript لبنيته، ثم اعرض أخطاءه دون إعادة تحميل الصفحة. خطوة بخطوة.',
  },
  colors: {
    en: 'Every TopClass UI color token in the light, dark and ocean modes, the six tones, where each color is used and the contrast every pair is checked against.',
    ar: 'كل رموز الألوان في TopClass UI في الأوضاع الفاتح والداكن والمحيط، والنبرات الست، وأين يُستخدم كل لون، والتباين الذي يُفحص مقابله كل زوج.',
  },
  icons: {
    en: 'Every built-in icon of TopClass UI by name, inlined as SVG and loaded only when rendered, with the sizes and the ones that flip by themselves in Arabic.',
    ar: 'الأيقونات المضمّنة في TopClass UI بأسمائها، مرسومة SVG داخل الصفحة ولا يُحمَّل منها إلا ما يُعرض، مع أحجامها والتي تنعكس وحدها في العربية.',
  },
  theming: {
    en: 'Light, dark and your own mode from one small CSS block, without touching a component. Six knobs change the shape of every component at once.',
    ar: 'وضع فاتح وداكن ووضعك الخاص من كتلة CSS صغيرة واحدة، دون لمس أي مكوّن. ستة مقابض تغيّر شكل كل المكوّنات دفعة واحدة، وبعض الأشياء لا تتغيّر عمدًا.',
  },
  rtl: {
    en: 'Arabic works without a code change: the layout, the icons and the digits follow the page, because no TopClass UI component may say left or right.',
    ar: 'العربية تعمل دون تغيير في الشيفرة: التخطيط والأيقونات والأرقام تتبع الصفحة، لأن أي مكوّن في TopClass UI لا يُسمح له بأن يقول يسار أو يمين.',
  },
  'server-first': {
    en: 'Most TopClass UI components render on the server and add no JavaScript. A component ships script only when it has to listen; here is which ones, and why.',
    ar: 'أغلب مكوّنات TopClass UI تُعرض على الخادم ولا تضيف أي JavaScript. المكوّن يرسل سكربتًا فقط حين يحتاج إلى الإصغاء لحدث؛ هذه هي، وهذا هو السبب.',
  },
  accessibility: {
    en: 'WCAG 2.2 AA, checked in a real browser: axe, target size, the focus ring and contrast. What a machine checks, what a person checks, and the known gaps.',
    ar: 'معيار WCAG 2.2 AA، مفحوص في متصفح حقيقي: axe وحجم الهدف وحلقة التركيز والتباين. ما تفحصه الآلة، وما يفحصه الإنسان، والثغرات المعروفة.',
  },
  components: {
    en: 'Every TopClass UI component on one page, with a live preview, a playground on the real props, every state and its import line.',
    ar: 'كل مكوّنات TopClass UI في صفحة واحدة، مع عرض حيّ ومساحة تجربة على الخصائص الحقيقية وكل الحالات وسطر الاستيراد، بالعربية والإنجليزية.',
  },
  changelog: {
    en: 'What changed in each release of TopClass UI, newest first, with the version it shipped in, the version policy and how to move past a breaking change.',
    ar: 'ما تغيّر في كل إصدار من TopClass UI، الأحدث أولًا، مع الإصدار الذي صدر فيه، وسياسة الإصدارات، وطريقة تجاوز أي تغيير غير متوافق.',
  },
}
