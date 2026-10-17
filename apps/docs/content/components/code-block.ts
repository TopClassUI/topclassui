// The hand-written data of CodeBlock's page and card (docs-site S7); `x` in a string is inline code.
export const content = {
  slug: 'code-block',
  demos: ['basic', 'highlighted', 'long-line', 'wrap', 'no-copy', 'no-header', 'rtl'],
  stageHeight: 10,
  related: ['kbd', 'card', 'tabs'],
  en: {
    title: 'Code block',
    description: 'Code in a box of its own, read left to right on any page. The block renders on the server; the copy button is its only script.',
    note: 'Pass the code as a template-literal child. No highlighter is built in: pass coloured nodes as highlighted.',
    notes: [
      'The code is `children`, a string: every space and line break is kept, and that string is what the button copies.',
      '`title` names the block: the code becomes a region named by it, and the button reads "Copy page.tsx".',
      '`lang` is written as `data-lang` and nothing else. To colour the code, make the nodes yourself, at build time or in your own Server Component, and pass them as `highlighted`; the button still copies `children`.',
      'A long line scrolls inside the block; `wrap` breaks it instead.',
      '`showCopy={false}` drops the button, and the block then ships no JavaScript at all.',
      'In a Server Component pass `{...getLabels(locale)}`: the button\'s words come from `labels.common`.',
    ],
    keyboard: [
      { keys: ['Tab'], action: 'Moves to the copy button, then to the code, which is a tab stop so a keyboard can scroll it.' },
      { keys: ['Enter', 'Space'], action: 'On the copy button, copies the code; a hidden status says "Copied" once.' },
      { keys: ['ArrowLeft', 'ArrowRight'], action: 'On the code, scrolls a long line sideways. With `wrap` nothing scrolls and the code is no tab stop.' },
    ],
    accessibility: [
      'The button\'s name never changes: the tick is the cue to the eye, and a polite status says "Copied" or "Could not copy" once per press.',
      'Copying needs a secure context (https or localhost); elsewhere the button says "Could not copy" and keeps its icon.',
      'Colours you pass in `highlighted` are yours to check against the block\'s surface.',
    ],
    rtl: 'The code is always `dir="ltr"` and `translate="no"`. The header keeps the page\'s direction, so in Arabic the copy button sits on the left, at the inline end.',
  },
  ar: {
    title: 'كتلة شيفرة',
    description: 'شيفرة في صندوق خاص بها، تُقرأ من اليسار إلى اليمين في أي صفحة. تُعرض على الخادم، وزر النسخ هو الشيفرة الوحيدة في المتصفح.',
    note: 'مرّر الشيفرة ابنًا بصيغة template literal. لا يوجد ملوّن مدمج: مرّر العقد الملوّنة عبر highlighted.',
    notes: [
      'الشيفرة هي `children`، نص واحد: تُحفظ كل مسافة وكل سطر جديد، وهذا النص هو ما ينسخه الزر.',
      '`title` يسمّي الكتلة: تصبح الشيفرة منطقة باسمه، ويُقرأ الزر "Copy page.tsx".',
      '`lang` يُكتب في `data-lang` ولا شيء غير ذلك. لتلوين الشيفرة أنشئ العقد بنفسك، وقت البناء أو في مكوّن خادم خاص بك، ومرّرها عبر `highlighted`؛ ويبقى الزر ينسخ `children`.',
      'السطر الطويل يُمرَّر أفقيًا داخل الكتلة؛ و`wrap` يكسره بدلًا من ذلك.',
      '`showCopy={false}` يزيل الزر، فلا ترسل الكتلة عندها أي JavaScript.',
      'في مكوّن الخادم مرّر `{...getLabels(locale)}`: كلمات الزر تأتي من `labels.common`.',
    ],
    keyboard: [
      { keys: ['Tab'], action: 'ينتقل إلى زر النسخ، ثم إلى الشيفرة، فهي تستقبل التركيز كي تُمرَّر بلوحة المفاتيح.' },
      { keys: ['Enter', 'Space'], action: 'على زر النسخ ينسخ الشيفرة؛ وتقول حالة مخفية "تم النسخ" مرة واحدة.' },
      { keys: ['ArrowLeft', 'ArrowRight'], action: 'على الشيفرة يمرّر السطر الطويل أفقيًا. مع `wrap` لا شيء يُمرَّر ولا تستقبل الشيفرة التركيز.' },
    ],
    accessibility: [
      'اسم الزر لا يتغير أبدًا: علامة الصح إشارة للعين، وحالة مهذبة تقول "تم النسخ" أو "تعذّر النسخ" مرة لكل ضغطة.',
      'النسخ يحتاج سياقًا آمنًا (https أو localhost)؛ وفي غيره يقول الزر "تعذّر النسخ" ويبقي أيقونته.',
      'الألوان التي تمرّرها في `highlighted` مسؤوليتك، فتحقق من تباينها مع سطح الكتلة.',
    ],
    rtl: 'الشيفرة دائمًا `dir="ltr"` و`translate="no"`. أما الترويسة فتتبع اتجاه الصفحة، فيقع زر النسخ في العربية على اليسار، عند نهاية السطر.',
  },
} as const
