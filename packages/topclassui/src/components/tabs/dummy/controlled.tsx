'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** value and onValueChange need a client file: a Server Component page cannot pass a
 * function. Here a button outside the list moves to the last tab. */
export default function Demo() {
  const [value, setValue] = useState('draft')
  return (
    <div className="grid gap-4">
      <TabsRoot value={value} onValueChange={(next: string) => { setValue(next) }}>
        <TabsList aria-label="Post">
          <TabsTab value="draft">Draft</TabsTab>
          <TabsTab value="review">Review</TabsTab>
          <TabsTab value="published">Published</TabsTab>
        </TabsList>
        <TabsPanel value="draft">Only you can see a draft.</TabsPanel>
        <TabsPanel value="review">Two reviewers have been asked.</TabsPanel>
        <TabsPanel value="published">Everyone can read a published post.</TabsPanel>
      </TabsRoot>
      <Button variant="outline" className="justify-self-start" onClick={() => { setValue('published') }}>
        Go to Published
      </Button>
    </div>
  )
}
