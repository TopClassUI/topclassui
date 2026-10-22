// The hand-written data of one component page (docs-site S7), in en and ar.
export const button = {
  slug: 'button',
  title: { en: 'Button', ar: 'زر' },
  description: {
    en: 'Five variants across six tones, with no script; render turns it into a real link.',
    ar: 'خمسة أنماط عبر ست نبرات، يُعرض على الخادم بلا JavaScript. ومن خلال render يصبح رابطًا حقيقيًا بالشكل نفسه.',
  },
  demos: ['variants', 'tones', 'sizes', 'with-icon', 'as-link', 'full-width', 'long-label', 'custom-size', 'skeleton', 'rtl'],
  stageHeight: 19.4375,
  stageDemo: 'variants',
  extraSwitches: ['disabled'],
  note: {
    en: '`loading` blocks clicks and announces itself with `aria-busy`, but keeps full colour, so it never reads as disabled.',
    ar: '`loading` يمنع النقر ويعلن عن نفسه عبر `aria-busy`، لكنه يحتفظ بلونه كاملًا فلا يبدو معطّلًا.',
  },
  notes: {
    en: [
      'For anything the user does on the page: submit, save, confirm, open a dialog.',
      'To go somewhere else, keep `Button` and pass `render={<Link href="/docs" />}`: it stays a real anchor, so middle-click and "open in new tab" still work.',
      '`loading` keeps full colour and shows a spinner; a disabled button dims. Both block it, and a blocked `render={<a href />}` loses its `href`, so it cannot be followed.',
      'A long label ends in an ellipsis and never pushes the page wider; `fullWidth` stretches the button to its container.',
      '`size="custom"` emits no size classes, so your own `className` sets the height and padding.',
    ],
    ar: [
      'لكل ما يفعله المستخدم في الصفحة: الإرسال، الحفظ، التأكيد، فتح نافذة حوار.',
      'للانتقال إلى مكان آخر أبقِ `Button` ومرّر `render={<Link href="/docs" />}`: يبقى رابطًا حقيقيًا، فيعمل النقر بالزر الأوسط و«الفتح في علامة تبويب جديدة».',
      '`loading` يحتفظ بلونه كاملًا ويعرض مؤشر انتظار، والزر المعطّل يخفت. كلاهما يمنع الزر، والرابط `render={<a href />}` الممنوع يفقد `href` فلا يمكن اتباعه.',
      'النص الطويل ينتهي بعلامة حذف ولا يوسّع الصفحة أبدًا، و`fullWidth` يمدّ الزر بعرض حاويته.',
      '`size="custom"` لا يضيف أصناف حجم، فيحدد `className` الخاص بك الارتفاع والحشو.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves the focus to the button.', ar: 'ينقل التركيز إلى الزر.' } },
    { keys: ['Enter'], action: { en: 'Activates the button, or follows the link it renders.', ar: 'يفعّل الزر، أو يتبع الرابط الذي يعرضه.' } },
    { keys: ['Space'], action: { en: 'Activates a native button.', ar: 'يفعّل الزر الأصلي.' } },
  ],
  accessibility: {
    en: [
      'A native `<button type="button">` by default, named by its own text; an icon beside the text is hidden from screen readers.',
      'While blocked, a native button carries the `disabled` attribute and leaves the tab order; any other element gets `aria-disabled` and `tabindex="-1"`.',
      'At least 24 by 24 px, 44 under a touch pointer, with a visible focus ring.',
    ],
    ar: [
      'افتراضيًا هو `<button type="button">` أصلي، يُسمّى بنصه، والأيقونة بجانب النص مخفية عن قارئ الشاشة.',
      'أثناء المنع يحمل الزر الأصلي السمة `disabled` ويخرج من ترتيب التنقل، وأي عنصر آخر يأخذ `aria-disabled` و`tabindex="-1"`.',
      'لا يقل عن 24 في 24 بكسل، و44 تحت مؤشر لمس، مع حلقة تركيز ظاهرة.',
    ],
  },
  rtl: {
    en: 'Nothing to set: the padding and the gap are logical, so the icon and the text swap sides together, and a directional icon such as an arrow flips.',
    ar: 'لا شيء يُضبط: الحشو والفراغ منطقيان، فتتبادل الأيقونة والنص موضعيهما معًا، وتنقلب الأيقونة الاتجاهية مثل السهم.',
  },
  related: {
    components: ['tag', 'kbd', 'segmented-control'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
