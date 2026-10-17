// R-5.1-3 as a type: the prop keys of a server component that React could not serialize across the boundary.
import type { DOMAttributes, ReactNode } from 'react'

/** The one function that may cross: a Server Action posted with the form's data. */
export type ServerAction = (formData: FormData) => void | Promise<void>

/** The native `on*` handlers a shared component inherits from its root element; decided in DECISIONS.md. */
type NativeHandler = Exclude<keyof DOMAttributes<Element>, 'children' | 'dangerouslySetInnerHTML'>

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

type IsServerAction<F> = F extends (...args: infer A) => infer R
  ? Same<A, [formData: FormData]> extends true ? (R extends void | Promise<void> ? true : false) : false
  : false

type Depth = [never, 0, 1, 2, 3, 4, 5]

/** True when `T` holds a function (a Server Action aside) or a class instance, which is an object with methods. */
export type HoldsUnserializable<T, D extends number = 5> = [D] extends [never] ? false
  : unknown extends T ? false
    : true extends (T extends unknown ? Member<T, D> : never) ? true : false

type Member<T, D extends number> =
  T extends ReactNode ? false
    : T extends (...args: never[]) => unknown ? (IsServerAction<T> extends true ? false : true)
      : T extends readonly (infer Item)[] ? HoldsUnserializable<Item, Depth[D]>
        : T extends object ? true extends { [K in keyof T]-?: HoldsUnserializable<T[K], Depth[D]> }[keyof T] ? true : false
          : false

/** A native handler is set aside only while it keeps React's own event signature, so `onChange(value)` still counts. */
type IsNativeHandler<K, V> = K extends NativeHandler ? (V extends DOMAttributes<Element>[K] ? true : false) : false

/** The keys of `Props` that cannot cross, with `ref` and the native handlers set aside. */
export type UnserializableKeys<Props> = {
  [K in keyof Props]-?: K extends 'ref' ? never
    : IsNativeHandler<K, Props[K]> extends true ? never
      : HoldsUnserializable<Props[K]> extends true ? K : never
}[keyof Props]
