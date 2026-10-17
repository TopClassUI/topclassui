import type { CSSProperties, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type { FileUpload, FileUploadDesignProps, FileUploadName, FileUploadProps, FileUploadReason } from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

describe('the props FileUpload adds come from the schema', () => {
  it('are maxFiles, maxSize, invalid and visibleRows, all optional', () => {
    expectTypeOf<keyof FileUploadDesignProps>().toEqualTypeOf<'maxFiles' | 'maxSize' | 'invalid' | 'visibleRows'>()
    expectTypeOf<FileUploadProps['maxFiles']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<FileUploadProps['maxSize']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<FileUploadProps['invalid']>().toEqualTypeOf<boolean | undefined>()
  })

  it('onValueChange receives the files kept, and nothing sets them: no value pair', () => {
    expectTypeOf<Parameters<NonNullable<FileUploadProps['onValueChange']>>[0]>().toEqualTypeOf<readonly File[]>()
    expectTypeOf<Extract<keyof FileUploadProps, 'value' | 'defaultValue'>>().toEqualTypeOf<never>()
  })

  it('maxFiles alone decides multiple; there is no size scale and no native onChange', () => {
    expectTypeOf<Extract<keyof FileUploadProps, 'multiple' | 'size' | 'type' | 'onChange'>>().toEqualTypeOf<never>()
  })

  it('the reasons are the two labels of a refused file', () => {
    expectTypeOf<FileUploadReason>().toEqualTypeOf<'tooLarge' | 'wrongType'>()
  })
})

describe('the root takes className, style and ref; the input takes the rest', () => {
  it('className is a string, style a style object, ref the root div', () => {
    expectTypeOf<FileUploadProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<FileUploadProps['style'], CSSProperties>>().toEqualTypeOf<true>()
    expectTypeOf<FileUploadProps['ref']>().toEqualTypeOf<Ref<HTMLDivElement> | undefined>()
  })

  it('the native form props reach the input', () => {
    expectTypeOf<FileUploadProps['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<FileUploadProps['accept']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<FileUploadProps['required']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FileUploadProps['disabled']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<FileUploadProps['form']>().toEqualTypeOf<string | undefined>()
  })

  it('FileUpload takes its props type as it is', () => {
    expectTypeOf<Parameters<typeof FileUpload>[0]>().toEqualTypeOf<FileUploadProps>()
  })
})

describe('the name is the shared control name (R-5.6-1)', () => {
  it('is ControlName: an id, an aria-label or an aria-labelledby', () => {
    expectTypeOf<Accepts<FileUploadName, { id: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<FileUploadName, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<FileUploadName, { 'aria-labelledby': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<FileUploadName, { title: string }>>().toEqualTypeOf<false>()
  })
})
