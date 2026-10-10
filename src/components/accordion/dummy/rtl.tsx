import { TopClassProvider } from '#shared/provider/provider.js'
import { AccordionItem, AccordionRoot } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. Nothing here is told the
 * direction: the title starts at the right and the caret sits at the left, the inline end. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <AccordionRoot defaultValue={['server']} className="max-w-105">
          <AccordionItem value="server" title="ما هو مكوّن الخادم؟" headingLevel={2}>
            <p>مكوّن يُعرض على الخادم ويرسل HTML فقط، دون أي JavaScript خاص به.</p>
          </AccordionItem>
          <AccordionItem value="arabic" title="هل يعمل بالعربية؟" headingLevel={2}>
            <p>نعم. ينتقل السهم إلى الحافة اليسرى ويبدأ النص من اليمنى.</p>
          </AccordionItem>
          <AccordionItem value="bundle" title="ما حجم الحزمة؟" headingLevel={2}>
            <p>نحو كيلوبايت واحد في المتصفح. الإجابات نفسها لا تكلّف شيئًا.</p>
          </AccordionItem>
        </AccordionRoot>
      </div>
    </TopClassProvider>
  )
}
