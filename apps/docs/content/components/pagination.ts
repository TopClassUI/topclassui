// The hand-written data of the Pagination page (docs-site S7), in English and Arabic.
export const content = {
  slug: 'pagination',
  demos: ['middle', 'first-page', 'last-page', 'sizes', 'many-pages', 'two-navs', 'custom-size', 'wide-numbers', 'rtl'],
  stageHeight: 6,
  related: ['breadcrumb', 'table', 'navbar'],
  en: {
    title: 'Pagination',
    description: 'Page numbers that are real links, not click handlers, so they work with no JavaScript and a crawler follows every page.',
    note: 'getHref keeps every page crawlable; value, siblingCount and boundaryCount are clamped to a safe range.',
    notes: [
      'Pass `value`, `pageCount` and `getHref`, which turns a page number into its address, such as /blog?page=3. Every cell is an anchor.',
      'In Next.js a plain link reloads the page. Pass `link={<Link href="" />}` and each page change is a client navigation.',
      'A bad page in the URL is clamped for what is shown: `?page=999` of 12 shows page 12. Query that same page with `clampPage(Number(page), pageCount)`.',
      '`siblingCount` and `boundaryCount` (0 to 3, default 1) set how many pages show around the current one and at each end.',
      '`size="md"` is 40 px, the height of a Button; `size="sm"` is the 32 px cell of the design. `custom` emits no size classes.',
      'The row wraps instead of scrolling. On a phone pass `siblingCount={0}` and `boundaryCount={0}` for a shorter row.',
      '`paginationVariants({ size, current })` returns the classes of one cell, for a link you render yourself.',
    ],
    a11y: [
      'The current page carries `aria-current="page"` and is named "Page 3 of 12"; every other cell is named "Page 4".',
      'Previous and next carry `rel="prev"` and `rel="next"`. On the first and the last page that control is disabled and has no href.',
      'Two navs on one page each need their own `aria-label`, such as "Orders pages, top" and "Orders pages, bottom".',
    ],
    keyboard: [
      { keys: 'Tab', action: 'Moves through first, previous, each page, next and last. A disabled control is skipped.' },
      { keys: 'Enter', action: 'Follows the focused link.' },
    ],
    rtl: 'Under dir="rtl" the row runs from the right and the four carets flip. `{...getLabels(\'ar\')}` passes the Arabic labels and locale together.',
  },
  ar: {
    title: 'ترقيم الصفحات',
    description: 'أرقام صفحات هي روابط حقيقية لا معالجات نقر، فتعمل دون JavaScript ويتبع الزاحف كل صفحة منها.',
    note: 'getHref يبقي كل صفحة قابلة للزحف، وقيم value وsiblingCount وboundaryCount محصورة في مدى آمن.',
    notes: [
      'مرّر `value` و`pageCount` و`getHref`، الدالة التي تحوّل رقم الصفحة إلى عنوانها، مثل /blog?page=3. كل خلية رابط حقيقي.',
      'في Next.js يعيد الرابط العادي تحميل الصفحة. مرّر `link={<Link href="" />}` فيصبح كل تغيير صفحة تنقّلًا من جهة المتصفح.',
      'الصفحة الخاطئة في العنوان تُحصر لما يُعرض: `?page=999` من 12 تعرض الصفحة 12. استعلم عن الصفحة نفسها بـ`clampPage(Number(page), pageCount)`.',
      '`siblingCount` و`boundaryCount` (من 0 إلى 3، والافتراضي 1) يحددان عدد الصفحات حول الحالية وعند كل طرف.',
      '`size="md"` ارتفاعه 40 px، ارتفاع الزر، و`size="sm"` هو خلية 32 px في التصميم. `custom` لا يضيف أصناف حجم.',
      'الصف يلتف بدل أن يمرّر. على الهاتف مرّر `siblingCount={0}` و`boundaryCount={0}` لصف أقصر.',
      '`paginationVariants({ size, current })` يعيد أصناف خلية واحدة، لرابط ترسمه بنفسك.',
    ],
    a11y: [
      'الصفحة الحالية عليها `aria-current="page"` واسمها «صفحة 3 من 12»، وكل خلية أخرى اسمها «صفحة 4».',
      'السابق والتالي عليهما `rel="prev"` و`rel="next"`. في الصفحة الأولى والأخيرة يكون ذلك الزر معطّلًا ودون href.',
      'إن كان في الصفحة عنصرا ترقيم فلكلٍّ منهما `aria-label` خاص به، مثل «صفحات الطلبات، أعلى» و«صفحات الطلبات، أسفل».',
    ],
    keyboard: [
      { keys: 'Tab', action: 'ينتقل بين الأولى والسابقة وكل صفحة والتالية والأخيرة. الزر المعطّل يُتخطّى.' },
      { keys: 'Enter', action: 'يتبع الرابط الذي عليه التركيز.' },
    ],
    rtl: 'مع dir="rtl" يبدأ الصف من اليمين وتنقلب الأسهم الأربعة. `{...getLabels(\'ar\')}` يمرّر النصوص العربية واللغة معًا.',
  },
} as const
