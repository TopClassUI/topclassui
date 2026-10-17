import type { ReactNode } from 'react'

/** R-8.2: loading, error and empty are part of every data component, not an afterthought. */
export const STATUSES = ['idle', 'loading', 'loading-more', 'error', 'empty'] as const
export type Status = (typeof STATUSES)[number]

export interface StateProps {
  status?: Status | undefined
  loadingFallback?: ReactNode | undefined
  errorFallback?: ReactNode | undefined
  emptyFallback?: ReactNode | undefined
  /** Client-only, or a Server Action. A plain function from a Server Component throws at render. */
  onRetry?: (() => void | Promise<void>) | undefined
}
