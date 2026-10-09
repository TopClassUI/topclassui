import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { Timeline } from '../index.js'

const EVENTS = [
  { id: 'created', title: 'أُنشئ المشروع', time: '٢ أكتوبر، ٠٩:١٢', status: 'done' },
  { id: 'paid', icon: <Svg icon={check} size="xs" />, title: 'وصلت الدفعة', time: '٤ أكتوبر، ١٦:٤٠', status: 'done' },
  { id: 'review', title: 'قيد المراجعة', time: 'اليوم', status: 'current' },
  { id: 'launch', title: 'الإطلاق', time: 'لم يُحدَّد موعده', status: 'todo' },
] as const

/** Right to left: the rail sits at the inline start by itself, with no direction prop. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar">
      <Timeline items={EVENTS} getKey={(event) => event.id} />
    </div>
  )
}
