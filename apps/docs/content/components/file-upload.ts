export const content = {
  slug: 'file-upload',
  demos: ['basic', 'multiple', 'in-field', 'form', 'rtl'],
  stageDemo: 'basic',
  stageHeight: 12,
  related: ['input', 'field', 'form', 'progress'],
  keyboard: [
    { keys: ['Tab'], en: 'Reaches the file input, and the zone draws the focus ring; then each remove button.', ar: 'يصل إلى حقل الملفات، فترسم المنطقة حلقة التركيز؛ ثم إلى كل زر إزالة.' },
    { keys: ['Enter', 'Space'], en: 'Open the file picker; on a remove button, remove that file.', ar: 'يفتحان منتقي الملفات؛ وعلى زر إزالة، يزيلان ذلك الملف.' },
  ],
  en: {
    title: 'File upload',
    description: 'A drop zone that is a real file input, so it works and posts before any script runs. Picked files show as a list.',
    note: '`maxSize` is in bytes and checked in the browser only: check it again in the action.',
    notes: [
      'The children are the hint inside the zone, such as "PDF or PNG, up to 5 MB", and they describe the input.',
      '`maxFiles` (1 to 100, default 1) alone decides whether the input takes several files at once; with 1 a new file replaces the old one.',
      '`maxSize` refuses a larger file as too large; each refusal is read out, and a refused file is never sent.',
      'An input cannot set its form\'s encType: a form with a string action needs multipart/form-data, or it sends only the file names.',
      'The list adds up across picks and drops and shows `visibleRows` rows before it scrolls. `onValueChange` hears the kept files after each change.',
    ],
    accessibility: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`.',
      'Each file has a remove button named after it, such as "Remove brief.pdf"; after a remove the focus goes to the next file, else the previous one, else the input.',
      'A drag of files marks the zone with a solid primary line; under forced colours the line is Highlight. `invalid` turns it to danger.',
    ],
    rtl: 'The zone centres, the rows mirror, and each file name takes its own direction. Sizes are written in the reader\'s digits.',
  },
  ar: {
    title: 'رفع الملفات',
    description: 'منطقة إفلات هي حقل ملفات حقيقي، فتعمل وتُرسل قبل تشغيل أي سكربت. والملفات المختارة تظهر في قائمة.',
    note: '`maxSize` بالبايت، ويُتحقق منه في المتصفح فقط: تحقّق منه مجددًا في الإجراء.',
    notes: [
      'العناصر الأبناء هي التلميح داخل المنطقة، مثل «PDF أو PNG، حتى 5 ميغابايت»، وهي تصف الحقل.',
      '`maxFiles` (من 1 إلى 100، والافتراضي 1) هو وحده ما يقرر إن كان الحقل يقبل عدة ملفات دفعة واحدة؛ ومع 1 يحل الملف الجديد محل القديم.',
      '`maxSize` يرفض الملف الأكبر لأنه كبير جدًا؛ ويُعلن كل رفض، ولا يُرسل الملف المرفوض أبدًا.',
      'لا يستطيع الحقل ضبط encType لنموذجه: النموذج ذو الإجراء النصي يحتاج multipart/form-data، وإلا أرسل أسماء الملفات فقط.',
      'تتراكم القائمة عبر الاختيارات والإفلاتات، وتعرض `visibleRows` صفوف قبل التمرير. و`onValueChange` يستقبل الملفات المحفوظة بعد كل تغيير.',
    ],
    accessibility: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`.',
      'لكل ملف زر إزالة يحمل اسمه، مثل «إزالة brief.pdf»؛ وبعد الإزالة ينتقل التركيز إلى الملف التالي، أو السابق، أو إلى الحقل.',
      'سحب الملفات يميّز المنطقة بخط أساسي متصل؛ وفي وضع الألوان القسرية يصبح الخط Highlight. و`invalid` يحوّله إلى لون الخطر.',
    ],
    rtl: 'تتوسط المنطقة، وتنعكس الصفوف، ويأخذ كل اسم ملف اتجاهه الخاص. وتُكتب الأحجام بأرقام القارئ.',
  },
} as const
