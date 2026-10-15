'use client'

import { createContext, useContext } from 'react'

/** The errors a form action returned, by field name: one message, several, or none. */
export type FormErrors = Readonly<Record<string, string | readonly string[] | undefined>>

/** Provided by FormAction and read by FieldLive, so neither component imports the other. */
export const FormErrorsContext = createContext<FormErrors | undefined>(undefined)

/** The errors of the nearest FormAction, or undefined outside one. */
export function useFormErrors(): FormErrors | undefined {
  return useContext(FormErrorsContext)
}
