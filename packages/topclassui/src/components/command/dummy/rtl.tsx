'use client'

import { useState } from 'react'

import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string, group: string }

const COMMANDS: Entry[] = [
  { id: 'new', label: 'ملف جديد', group: 'الملفات' },
  { id: 'recent', label: 'فتح ملف حديث', group: 'الملفات' },
  { id: 'theme', label: 'تغيير المظهر', group: 'التفضيلات' },
  { id: 'language', label: 'تغيير اللغة', group: 'التفضيلات' },
  { id: 'docs', label: 'قراءة الدليل', group: 'المساعدة' },
]

/** Arabic, inside TopClassProvider as the root layout would mount it. The palette is portaled into
 * the body, so it takes its direction and its language from the provider: the glass sits at the
 * right of the input, the rows are right-aligned and the placeholder is Arabic, on an English page too. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState('')
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-3">
        <Button variant="outline" onClick={() => { setOpen(true) }}><Svg icon={magnifyingGlass} />بحث</Button>
        <Command
          items={COMMANDS}
          getKey={(command) => command.id}
          getLabel={(command) => command.label}
          getGroup={(command) => command.group}
          onSelect={(command) => { setRan(command.label) }}
          open={open}
          onOpenChange={setOpen}
        />
        <p data-testid="ran" className="text-sm text-muted">{ran}</p>
      </div>
    </TopClassProvider>
  )
}
