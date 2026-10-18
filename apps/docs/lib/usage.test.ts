import { describe, expect, it } from 'vitest'

import { attributeOf, changedProps, snippetOf, usageOf } from './usage'

const BUTTON = `import { Button } from 'topclassui/button'
import type { ButtonDesignProps } from 'topclassui/button'

/** The site's Try it stage. */
export default function Demo(props: ButtonDesignProps) {
  return <Button {...props}>Save</Button>
}
`

const SEGMENTED = `import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
import type { SegmentedControlDesignProps } from 'topclassui/segmented-control'

export default function Demo(props: SegmentedControlDesignProps) {
  return (
    <SegmentedControlRoot {...props} aria-label="View" defaultValue="board">
      <SegmentedControlItem value="board">Board</SegmentedControlItem>
      <SegmentedControlItem value="table">Table</SegmentedControlItem>
    </SegmentedControlRoot>
  )
}
`

const DIALOG = `import { Button } from 'topclassui/button'
import { DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from 'topclassui/dialog'
import type { DialogDesignProps } from 'topclassui/dialog'

export default function Demo({ size, closeButton }: DialogDesignProps = {}) {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogPopup size={size}>
        <DialogHeader closeButton={closeButton}>
          <DialogTitle>Publish changes</DialogTitle>
        </DialogHeader>
      </DialogPopup>
    </DialogRoot>
  )
}
`

const STATEFUL = `'use client'

import { useState } from 'react'

import { Command } from 'topclassui/command'
import type { CommandDesignProps } from 'topclassui/command'

export default function Demo({ visibleRows, defaultOpen }: CommandDesignProps = {}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return <Command visibleRows={visibleRows} open={open} onOpenChange={setOpen} />
}
`

describe('usageOf', () => {
  it('keeps the value imports and the one-line tree, and drops the type import', () => {
    expect(usageOf(BUTTON)).toEqual({
      imports: ["import { Button } from 'topclassui/button'"],
      jsx: '<Button {...props}>Save</Button>',
      passed: [],
    })
  })

  it('dedents a tree written over several lines to its root', () => {
    expect(usageOf(SEGMENTED)?.jsx).toBe([
      '<SegmentedControlRoot {...props} aria-label="View" defaultValue="board">',
      '  <SegmentedControlItem value="board">Board</SegmentedControlItem>',
      '  <SegmentedControlItem value="table">Table</SegmentedControlItem>',
      '</SegmentedControlRoot>',
    ].join('\n'))
  })

  it('reads the props a demo destructures and passes on by name, each to its own part', () => {
    expect(usageOf(DIALOG)).toEqual({
      imports: [
        "import { Button } from 'topclassui/button'",
        "import { DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from 'topclassui/dialog'",
      ],
      jsx: [
        '<DialogRoot>',
        '  <DialogTrigger render={<Button>Publish</Button>} />',
        '  <DialogPopup size={size}>',
        '    <DialogHeader closeButton={closeButton}>',
        '      <DialogTitle>Publish changes</DialogTitle>',
        '    </DialogHeader>',
        '  </DialogPopup>',
        '</DialogRoot>',
      ].join('\n'),
      passed: ['size', 'closeButton'],
    })
  })

  it('reads nothing from a demo that holds state before its return, since the snippet would lose it', () => {
    expect(usageOf(STATEFUL)).toBeNull()
  })

  it('reads nothing from a demo that never spreads its props', () => {
    expect(usageOf('export default function Demo() {\n  return <Kbd>K</Kbd>\n}\n')).toBeNull()
  })
})

describe('attributeOf', () => {
  it('writes each value the way a reader types it', () => {
    expect(attributeOf('size', 'lg')).toBe('size="lg"')
    expect(attributeOf('loading', true)).toBe('loading')
    expect(attributeOf('fullWidth', false)).toBe('fullWidth={false}')
    expect(attributeOf('max', 5)).toBe('max={5}')
  })
})

describe('changedProps', () => {
  it('keeps only the values that differ from the defaults, in order', () => {
    expect(changedProps({ variant: 'soft', tone: 'primary', loading: true }, { variant: 'solid', tone: 'primary', loading: false }))
      .toEqual([['variant', 'soft'], ['loading', true]])
  })
})

describe('snippetOf', () => {
  it('removes the spread at rest', () => {
    expect(snippetOf({ imports: ["import { Button } from 'topclassui/button'"], jsx: '<Button {...props}>Save</Button>', passed: [] }, []))
      .toBe("import { Button } from 'topclassui/button'\n\n<Button>Save</Button>")
  })

  it('writes the changed props where the spread was', () => {
    expect(snippetOf({ imports: [], jsx: '<Button {...props}>Save</Button>', passed: [] }, [['variant', 'soft'], ['loading', true]]))
      .toBe('<Button variant="soft" loading>Save</Button>')
  })

  it('removes each pass-through at rest', () => {
    const usage = { imports: [], jsx: '<Root>\n  <Popup size={size}>\n    <Header closeButton={closeButton} />\n  </Popup>\n</Root>', passed: ['size', 'closeButton'] }
    expect(snippetOf(usage, [])).toBe('<Root>\n  <Popup>\n    <Header />\n  </Popup>\n</Root>')
  })

  it('writes each changed prop on the part that takes it', () => {
    const usage = { imports: [], jsx: '<Root>\n  <Popup size={size}>\n    <Header closeButton={closeButton} />\n  </Popup>\n</Root>', passed: ['size', 'closeButton'] }
    expect(snippetOf(usage, [['closeButton', false], ['size', 'lg']])).toBe('<Root>\n  <Popup size="lg">\n    <Header closeButton={false} />\n  </Popup>\n</Root>')
  })
})
