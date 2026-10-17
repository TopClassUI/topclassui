// Loaded into a live page by e2e/radio-group.spec.ts: what a careless caller hands a radio group (unit-4.md, "Fixtures").
// A 300-character word, a radio whose value is the empty string, an empty text, and a group of sixty radios.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { RadioGroupItem, RadioGroupRoot } from '#components/radio-group/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'Supercalifragilistic'.repeat(15)
const SIXTY = Array.from({ length: 60 }, (_, at) => String(at + 1))

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <form id="hostile" style={{ display: 'grid', gap: 24, padding: 16, alignContent: 'start' }}>
        <RadioGroupRoot aria-label="A long word" name="word" defaultValue="long">
          <RadioGroupItem value="long">{WORD}</RadioGroupItem>
          <RadioGroupItem value="short">Short</RadioGroupItem>
        </RadioGroupRoot>
        <RadioGroupRoot aria-label="An empty value" name="empty" defaultValue="">
          <RadioGroupItem value="">None</RadioGroupItem>
          <RadioGroupItem value="some">Some</RadioGroupItem>
          <RadioGroupItem value="blank" aria-label="Blank">{''}</RadioGroupItem>
        </RadioGroupRoot>
        <RadioGroupRoot aria-label="Sixty" name="sixty" defaultValue="1" orientation="horizontal">
          {SIXTY.map((value) => <RadioGroupItem key={value} value={value}>{`Option ${value}`}</RadioGroupItem>)}
        </RadioGroupRoot>
      </form>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
