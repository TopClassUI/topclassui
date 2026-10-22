// The hand-written data of one component page (docs-site S7), in en and ar.
export const tag = {
  slug: 'tag',
  title: { en: 'Tag', ar: 'وسم' },
  description: {
    en: 'A label chip for a topic, rendered on the server. Passing onRemove adds an x button, the only part that runs in the browser.',
    ar: 'شريحة تسمية لموضوع، تُعرض على الخادم. تمرير onRemove يضيف زر إزالة، وهو الجزء الوحيد الذي يعمل في المتصفح.',
  },
  demos: ['topics', 'tones', 'sizes', 'with-icon', 'removable', 'removable-sizes', 'link', 'long-label', 'element-label', 'custom-size', 'rtl'],
  stageHeight: 19.4375,
  stageDemo: 'stage',
  codeDemo: 'topics',
  extraSwitches: ['removable', 'disabled'],
  note: {
    en: 'A plain Tag stays on the server; `onRemove` is the switch that adds the x, and taking the tag out of the list is yours.',
    ar: 'الوسم العادي يبقى على الخادم، و`onRemove` هو ما يضيف زر الإزالة، وإخراج الوسم من القائمة مسؤوليتك.',
  },
  notes: {
    en: [
      'For a topic, a category or a keyword, usually several in a wrapping row. For a status such as Paid or Overdue, use a Badge.',
      'Tag has no ARIA role, so the text carries the meaning; colour alone never does. `tone` defaults to neutral, so a row of tags stays quiet.',
      'The x only calls `onRemove`. A Server Component can pass it only as a Server Action; to keep the list in state, put it in a client component.',
      'A Tag stays on one line: plain text ends in an ellipsis, an element given as the label is clipped at the edge, and the x always stays whole. In a row that does not wrap, add `className="shrink"` to let it shrink.',
      'For a linked tag, put `tagVariants()` on the link itself and the label in a span of its own; never put a link inside a Tag.',
    ],
    ar: [
      'لموضوع أو فئة أو كلمة مفتاحية، وعادةً عدة وسوم في صف يلتف. ولحالة مثل «مدفوع» أو «متأخر» استخدم `Badge`.',
      'لا دور ARIA لـ`Tag`، فالنص هو ما يحمل المعنى، واللون وحده لا يحمله أبدًا. القيمة الافتراضية لـ`tone` هي neutral، فيبقى صف الوسوم هادئًا.',
      'زر الإزالة يستدعي `onRemove` فقط. لا يمرّره مكوّن خادم إلا كإجراء خادم، ولحفظ القائمة في الحالة ضعها في مكوّن عميل.',
      'يبقى الوسم في سطر واحد: النص العادي ينتهي بعلامة حذف، والعنصر المُمرَّر كتسمية يُقصّ عند الحافة، ويبقى زر الإزالة كاملًا دائمًا. وفي صف لا يلتف أضف `className="shrink"` ليتقلّص.',
      'للوسم المرتبط برابط ضع `tagVariants()` على الرابط نفسه والتسمية في `span` خاص بها، ولا تضع رابطًا داخل `Tag` أبدًا.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves the focus to the x of a removable tag; a plain tag takes no focus.', ar: 'ينقل التركيز إلى زر الإزالة في الوسم القابل للإزالة، والوسم العادي لا يأخذ التركيز.' } },
    { keys: ['Enter'], action: { en: 'Calls `onRemove`.', ar: 'يستدعي `onRemove`.' } },
    { keys: ['Space'], action: { en: 'Calls `onRemove`.', ar: 'يستدعي `onRemove`.' } },
  ],
  accessibility: {
    en: [
      'The x is named by its own word, then the label, so it reads "Remove React"; the word comes from the provider\'s labels ("إزالة" in Arabic).',
      'A removed x takes the focus with it: send it to the next x, or the one before, and to a control after the list when it empties.',
      'The x is 24 px, 44 under a touch pointer, with a visible focus ring.',
    ],
    ar: [
      'يُسمّى زر الإزالة بكلمته ثم بالتسمية، فيُقرأ «إزالة React»، والكلمة تأتي من تسميات المزوّد («Remove» بالإنجليزية).',
      'زر الإزالة المحذوف يأخذ التركيز معه: أرسله إلى الزر التالي أو السابق، وإلى عنصر تحكم بعد القائمة عندما تفرغ.',
      'زر الإزالة 24 بكسل، و44 تحت مؤشر لمس، مع حلقة تركيز ظاهرة.',
    ],
  },
  rtl: {
    en: 'The padding is logical, so the x moves to the inline end and an icon to the inline start with no extra code.',
    ar: 'الحشو منطقي، فينتقل زر الإزالة إلى نهاية السطر والأيقونة إلى بدايته بلا شيفرة إضافية.',
  },
  related: {
    components: ['button', 'kbd', 'segmented-control'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
