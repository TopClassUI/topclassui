import { TopClassProvider } from '#shared/provider/provider.js'
import { FileUpload } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it: the zone's words, the sizes and the reasons
 * come from the Arabic labels, and each file name takes its own direction. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid gap-1.5">
        <label htmlFor="file-upload-rtl" className="text-sm font-medium text-body">المرفقات</label>
        <FileUpload id="file-upload-rtl" name="attachments" accept="application/pdf,image/png" maxFiles={5} maxSize={5 * 1024 * 1024}>
          PDF أو PNG، حتى 5 ملفات
        </FileUpload>
      </div>
    </TopClassProvider>
  )
}
