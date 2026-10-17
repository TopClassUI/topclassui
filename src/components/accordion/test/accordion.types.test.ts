import type { Accordion } from '@base-ui/react/accordion'
import type { CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  AccordionDesignProps, AccordionHeading, AccordionHeadingLevel, AccordionItemProps, AccordionRootProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the root is Base UI root, derived at the seam (R-5.7-5)', () => {
  it('names the open items as an array of strings, where Base UI takes any value', () => {
    expectTypeOf<AccordionRootProps['value']>().toEqualTypeOf<string[] | undefined>()
    expectTypeOf<AccordionRootProps['defaultValue']>().toEqualTypeOf<string[] | undefined>()
  })

  it('passes every other Base UI prop through with its own type', () => {
    expectTypeOf<AccordionRootProps['multiple']>().toEqualTypeOf<Accordion.Root.Props['multiple']>()
    expectTypeOf<AccordionRootProps['disabled']>().toEqualTypeOf<Accordion.Root.Props['disabled']>()
    expectTypeOf<AccordionRootProps['keepMounted']>().toEqualTypeOf<Accordion.Root.Props['keepMounted']>()
    expectTypeOf<AccordionRootProps['hiddenUntilFound']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<AccordionRootProps['render']>().toEqualTypeOf<Accordion.Root.Props<string>['render']>()
  })

  it('hands onValueChange the array of strings and the details Base UI gives', () => {
    expectTypeOf<Parameters<NonNullable<AccordionRootProps['onValueChange']>>[0]>().toEqualTypeOf<string[]>()
    expectTypeOf<Parameters<NonNullable<AccordionRootProps['onValueChange']>>[1]>().toEqualTypeOf<Accordion.Root.ChangeEventDetails>()
  })

  it('takes a className that is a string, never the state function Base UI allows', () => {
    expectTypeOf<AccordionRootProps['className']>().toEqualTypeOf<string | undefined>()
  })

  it('takes a ref to its div and a style', () => {
    expectTypeOf<Accepts<AccordionRootProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<AccordionRootProps['style'], CSSProperties>>().toEqualTypeOf<true>()
  })

  it('has no loopFocus and no orientation: Base UI 1.8.0 deprecates both, and neither moves the focus', () => {
    expectTypeOf<Accepts<keyof AccordionRootProps, 'loopFocus'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AccordionRootProps, 'orientation'>>().toEqualTypeOf<false>()
    // They are still there to leave out: when Base UI removes them, this line says so.
    expectTypeOf<Accepts<keyof Accordion.Root.Props, 'loopFocus' | 'orientation'>>().toEqualTypeOf<true>()
  })

  it('has no type, no collapsible and no variant, which the docs card draws', () => {
    expectTypeOf<Accepts<keyof AccordionRootProps, 'type'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AccordionRootProps, 'collapsible'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AccordionRootProps, 'variant'>>().toEqualTypeOf<false>()
  })
})

describe('the item', () => {
  it('requires a value that is a string, and a title', () => {
    expectTypeOf<AccordionItemProps['value']>().toEqualTypeOf<string>()
    expectTypeOf<AccordionItemProps['title']>().toEqualTypeOf<ReactNode>()
    // Neither can be left out: an object with no key at all is not an item.
    expectTypeOf<Accepts<Pick<AccordionItemProps, 'value'>, object>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<Pick<AccordionItemProps, 'title'>, object>>().toEqualTypeOf<false>()
  })

  it('takes a title that is text, a number or an element, since a Server Component renders it', () => {
    expectTypeOf<Accepts<AccordionItemProps['title'], 'Billing'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<AccordionItemProps['title'], ReactElement>>().toEqualTypeOf<true>()
  })

  it('takes children that are optional: a panel may be empty', () => {
    expectTypeOf<AccordionItemProps['children']>().toEqualTypeOf<ReactNode>()
    expectTypeOf<Accepts<Pick<AccordionItemProps, 'children'>, object>>().toEqualTypeOf<true>()
  })

  it('takes headingLevel as an optional number, from the schema', () => {
    expectTypeOf<AccordionItemProps['headingLevel']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<AccordionItemProps['headingLevel']>().toEqualTypeOf<AccordionDesignProps['headingLevel']>()
  })

  it('passes disabled and onOpenChange through from Base UI item', () => {
    expectTypeOf<AccordionItemProps['disabled']>().toEqualTypeOf<Accordion.Item.Props['disabled']>()
    expectTypeOf<AccordionItemProps['onOpenChange']>().toEqualTypeOf<Accordion.Item.Props['onOpenChange']>()
  })

  it('takes a className that is a string, and a ref to the div of the item', () => {
    expectTypeOf<AccordionItemProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<AccordionItemProps['ref'], Ref<HTMLDivElement>>>().toEqualTypeOf<true>()
  })

  it('has no hiddenUntilFound and no keepMounted of its own: the root decides for every panel', () => {
    expectTypeOf<Accepts<keyof AccordionItemProps, 'hiddenUntilFound'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AccordionItemProps, 'keepMounted'>>().toEqualTypeOf<false>()
  })
})

describe('the design props and the heading', () => {
  it('are the three the schema holds, each optional', () => {
    expectTypeOf<keyof AccordionDesignProps>().toEqualTypeOf<'hiddenUntilFound' | 'headingLevel' | 'items'>()
    expectTypeOf<AccordionDesignProps['hiddenUntilFound']>().toEqualTypeOf<boolean | undefined>()
  })

  it('names the five levels and the five tags a heading inside a page can take', () => {
    expectTypeOf<AccordionHeadingLevel>().toEqualTypeOf<2 | 3 | 4 | 5 | 6>()
    expectTypeOf<AccordionHeading>().toEqualTypeOf<'h2' | 'h3' | 'h4' | 'h5' | 'h6'>()
  })
})
