// The hand-written data of one component page (docs-site S7), in en and ar.
export const avatar = {
  slug: 'avatar',
  title: { en: 'Avatar', ar: 'صورة رمزية' },
  description: {
    en: 'A picture, initials or an icon in a circle, on the same five sizes as every control so an avatar and a button line up.',
    ar: 'صورة أو أحرف أولى أو أيقونة داخل دائرة، بالأحجام الخمسة نفسها لكل عنصر تحكم، فتصطف الصورة الرمزية مع الزر في الصف نفسه.',
  },
  demos: ['basic', 'with-name', 'sizes', 'icon', 'failed', 'skeleton', 'custom-size', 'rtl'],
  stageHeight: 8,
  stageDemo: 'basic',
  note: {
    en: 'The fallback shows while the picture loads and after it fails; initials are its children.',
    ar: 'يظهر البديل أثناء تحميل الصورة وبعد فشلها؛ والأحرف الأولى هي محتواه.',
  },
  notes: {
    en: [
      'Every part is a flat export: `AvatarRoot`, `AvatarImage`, `AvatarFallback` and `AvatarSkeleton`. There is no `Avatar`, and only `AvatarRoot` takes `size`.',
      'Always render the fallback: the picture is laid over it, so it shows until the picture paints, with no JavaScript.',
      '`AvatarImage` is the one client part. A picture that fails turns transparent and stays, so its `alt` still names the avatar, and the fallback shows.',
      'An avatar of initials or an icon stays server HTML. Every avatar with a picture hydrates, so a table of fifty rows with pictures is fifty client parts.',
      'For next/image, pass it as `render` on `AvatarImage`; it carries its own picture and alt text.',
    ],
    ar: [
      'كل جزء مُصدَّر باسم مستقل: `AvatarRoot` و`AvatarImage` و`AvatarFallback` و`AvatarSkeleton`. لا يوجد `Avatar`، ووحده `AvatarRoot` يأخذ `size`.',
      'اعرض البديل دائمًا: الصورة توضع فوقه، فيظهر حتى تُرسم الصورة، بلا JavaScript.',
      '`AvatarImage` هو جزء العميل الوحيد. الصورة التي تفشل تصبح شفافة وتبقى، فيظل `alt` يسمّي الصورة الرمزية ويظهر البديل.',
      'الصورة الرمزية بالأحرف الأولى أو بأيقونة تبقى HTML من الخادم. وكل صورة رمزية فيها صورة تمر بالترطيب، فجدول من خمسين صفًا بالصور يعني خمسين جزءًا في المتصفح.',
      'لاستخدام next/image مرّره عبر `render` في `AvatarImage`؛ فهو يحمل صورته ونصه البديل.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      '`AvatarImage` requires `alt`, or a `render` element that carries its own. Pass `alt=""` when the name is written beside the avatar, so it is not read twice.',
      'The fallback renders `aria-hidden="true"`, so the picture\'s `alt` is the one name a screen reader reads.',
      'With no picture and no name beside it, put `aria-label` on `AvatarRoot`: it then renders `role="img"` itself.',
    ],
    ar: [
      'يتطلب `AvatarImage` قيمة `alt`، أو عنصر `render` يحمل نصه البديل. مرّر `alt=""` عندما يكون الاسم مكتوبًا بجانب الصورة الرمزية، كي لا يُقرأ مرتين.',
      'يُعرض البديل مع `aria-hidden="true"`، فيكون `alt` الصورة هو الاسم الوحيد الذي يقرؤه قارئ الشاشة.',
      'إن لم تكن هناك صورة ولا اسم بجانبها، ضع `aria-label` على `AvatarRoot`: عندها يضيف `role="img"` بنفسه.',
    ],
  },
  rtl: {
    en: 'The circle has no side to mirror; in a row, the avatar sits at the inline start and Arabic initials read right to left.',
    ar: 'لا جهة في الدائرة تنعكس؛ في الصف تأتي الصورة الرمزية عند بداية السطر، والأحرف الأولى العربية تُقرأ من اليمين إلى اليسار.',
  },
  related: {
    components: ['avatar-group', 'badge', 'skeleton', 'card'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
