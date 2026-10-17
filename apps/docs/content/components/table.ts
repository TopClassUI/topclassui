// The hand-written data of one component page (docs-site S7), in en and ar.
export const table = {
  slug: 'table',
  title: { en: 'Table', ar: 'جدول' },
  description: {
    en: 'A real HTML table rendered on the server: sorting is a link per header, the first column can stick, and it ships no JavaScript.',
    ar: 'جدول HTML حقيقي يُعرض على الخادم: الترتيب رابط في كل عنوان عمود، والعمود الأول يمكن تثبيته، ولا يشحن أي JavaScript.',
  },
  demos: [
    'basic', 'sorted', 'sticky-first-column', 'row-actions', 'striped', 'caption', 'column-classes', 'empty',
    'skeleton', 'in-a-layout', 'rtl',
  ],
  stageHeight: 22,
  note: {
    en: 'Sorting is a link the server answers with the rows in their new order, so a sorted table costs no JavaScript.',
    ar: 'الترتيب رابط يجيب عنه الخادم بالصفوف في ترتيبها الجديد، فلا يكلّف الجدول المرتّب أي JavaScript.',
  },
  notes: {
    en: [
      '`caption` is required, in real words: it is the only name of the table. It is read out but not drawn; `captionVisible` draws it.',
      'A column with `sortHref` makes its header a link. Sort the rows on the server and pass `sort` to mark the column; in Next.js pass `link={<Link href="" />}`.',
      'Table renders the `items` it is given, already sorted and paged; Pagination moves between pages.',
      'Cells stay on one line, so a narrow screen scrolls the table sideways instead of stacking words. A column of prose opts out with its own `className`.',
      '`stickyFirstColumn` keeps the first column in view, cut with an ellipsis past `--tc-table-sticky-width`.',
      '`columns` and `getKey` hold functions, so build the columns where you render the table, not in a Server Component that passes them to a Client Component.',
    ],
    ar: [
      '`caption` مطلوب، بكلمات حقيقية: هو الاسم الوحيد للجدول. يُقرأ ولا يُرسم، و`captionVisible` يرسمه.',
      'العمود الذي يحمل `sortHref` يصبح عنوانه رابطًا. رتّب الصفوف على الخادم ومرّر `sort` لتمييز العمود، وفي Next.js مرّر `link={<Link href="" />}`.',
      'يعرض الجدول `items` كما تصله، مرتّبة ومقسّمة إلى صفحات مسبقًا، وPagination هو ما ينتقل بين الصفحات.',
      'تبقى الخلايا على سطر واحد، فيُمرَّر الجدول أفقيًا على الشاشة الضيقة بدل أن تتكدّس الكلمات. عمود النص الطويل يستثني نفسه بـ `className` خاص به.',
      '`stickyFirstColumn` يُبقي العمود الأول ظاهرًا، ويُقصّ بعلامة حذف بعد `--tc-table-sticky-width`.',
      '`columns` و`getKey` يحملان دوالّ، فابنِ الأعمدة حيث تعرض الجدول، لا في مكوّن خادم يمرّرها إلى مكوّن عميل.',
    ],
  },
  keyboard: [
    {
      keys: ['Tab'],
      action: {
        en: 'Reaches the scrolling box, then each sort link and each control in the cells.',
        ar: 'يصل إلى الصندوق القابل للتمرير، ثم إلى كل رابط ترتيب وكل عنصر تحكم في الخلايا.',
      },
    },
    {
      keys: ['ArrowLeft', 'ArrowRight'],
      action: { en: 'Scroll the focused box sideways.', ar: 'تمرّر الصندوق المركَّز عليه أفقيًا.' },
    },
    { keys: ['Enter'], action: { en: 'Follows a sort link.', ar: 'يتبع رابط الترتيب.' } },
  ],
  accessibility: {
    en: [
      'A real `<table>`: a screen reader moves through it by row and by column. Mark the column that identifies a row with `rowHeader: true`.',
      'The sorted column carries `aria-sort`, and its caret says the direction in words, because `aria-sort` is not read out everywhere.',
      'Name a row action by its row, such as "Refund order 1042", never a bare "Refund" repeated on every row.',
    ],
    ar: [
      'جدول `<table>` حقيقي: يتنقّل فيه قارئ الشاشة صفًا صفًا وعمودًا عمودًا. ميّز العمود الذي يعرّف الصف بـ `rowHeader: true`.',
      'العمود المرتّب يحمل `aria-sort`، والسهم فيه يقول الاتجاه بالكلمات، لأن `aria-sort` لا يُقرأ في كل مكان.',
      'سمِّ إجراء الصف باسم صفه، مثل «استرداد الطلب 1042»، لا «استرداد» وحدها مكرّرة في كل صف.',
    ],
  },
  rtl: {
    en: 'The first column sticks to the right edge, an end-aligned amount sits on the left, and the built-in words come from `labels`.',
    ar: 'يلتصق العمود الأول بالحافة اليمنى، ويقع المبلغ المحاذى إلى النهاية على اليسار، والكلمات المدمجة تأتي من `labels`.',
  },
  related: {
    components: ['pagination', 'tree-view', 'empty-state', 'skeleton'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
