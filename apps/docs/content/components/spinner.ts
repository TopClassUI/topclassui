// The hand-written data of the Spinner page (S7), in both locales.
export const spinner = {
  slug: 'spinner',
  title: { en: 'Spinner', ar: 'مؤشر التحميل' },
  description: {
    en: 'A spinner is an icon: it takes the icon sizes and follows the text it sits in.',
    ar: 'للانتظار مجهول المدة. مؤشر التحميل أيقونة، فيأخذ أحجام الأيقونات من 16 إلى 40 بكسل، ويمكنه أن يتبع النص الذي يجلس فيه.',
  },
  note: {
    en: 'Prefer Skeleton when the shape of what is coming is known; Spinner is for unknown waits.',
    ar: 'فضّل Skeleton عندما يكون شكل القادم معروفًا؛ مؤشر التحميل للانتظار المجهول.',
  },
  demos: ['with-text', 'sizes', 'tones', 'inherit-color', 'custom-size', 'rtl'],
  stageHeight: 15.625,
  stageDemo: 'stage',
  notes: {
    en: [
      'For a route still loading or a preview still building. When the shape of what is coming is known, a list or a table among them, a Skeleton holds its place instead.',
      '`size="custom"` sets no size, so the spinner is 1em and grows with the text around it.',
      'To take the colour of the surrounding text instead of a `tone`, pass `className="text-current"`.',
    ],
    ar: [
      'لمسار ما زال يُحمَّل أو معاينة ما زالت تُبنى. وعندما يكون شكل القادم معروفًا، كقائمة أو جدول، يحفظ Skeleton مكانه بدلًا منه.',
      '`size="custom"` لا يضع حجمًا، فيكون المؤشر بحجم 1em ويكبر مع النص المحيط به.',
      'لتأخذ لون النص المحيط بدل `tone`، مرّر `className="text-current"`.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'Named but silent: an image named by `labels.common.loading`, or your own `aria-label`, with no live region.',
      'Beside text that already names the wait, pass `aria-hidden` so the wait is not read twice.',
      'In forced colours it takes the system text colour of its parent, so it stays visible in Windows high contrast, and reduced motion stops the turn.',
    ],
    ar: [
      'له اسم لكنه صامت: صورة اسمها `labels.common.loading`، أو `aria-label` خاص بك، بلا منطقة حية.',
      'بجانب نص يسمّي الانتظار أصلًا، مرّر `aria-hidden` كي لا يُقرأ الانتظار مرتين.',
      'تحت الألوان القسرية يأخذ لون نص النظام من عنصره الأب، فيبقى ظاهرًا في التباين العالي في Windows، وتقليل الحركة يوقف الدوران.',
    ],
  },
  rtl: {
    en: 'The circle turns the same way in both directions: it is never flipped. With the Arabic labels its default name is Arabic too.',
    ar: 'الدائرة تدور في الاتجاه نفسه في الاتجاهين ولا تُعكس أبدًا. ومع التسميات العربية يصبح اسمها الافتراضي عربيًا أيضًا.',
  },
  related: {
    components: ['progress', 'skeleton', 'button'],
    pages: ['accessibility'],
  },
} as const
