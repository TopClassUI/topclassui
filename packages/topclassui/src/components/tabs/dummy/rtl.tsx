import { TopClassProvider } from '#shared/provider/provider.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The first tab is at the
 * right, and the arrow keys follow: the left arrow goes to the next tab, the right one back. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <TabsRoot defaultValue="overview">
          <TabsList aria-label="المشروع">
            <TabsTab value="overview">نظرة عامة</TabsTab>
            <TabsTab value="activity">النشاط</TabsTab>
            <TabsTab value="settings">الإعدادات</TabsTab>
          </TabsList>
          <TabsPanel value="overview">ارتفعت الإيرادات 12% عن الربع الماضي.</TabsPanel>
          <TabsPanel value="activity">عدّل ثلاثة أشخاص هذا المشروع اليوم.</TabsPanel>
          <TabsPanel value="settings">لا يعيد تسمية المشروع أو يحذفه إلا مالكه.</TabsPanel>
        </TabsRoot>
      </div>
    </TopClassProvider>
  )
}
