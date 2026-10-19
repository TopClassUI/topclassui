// The TopClass UI mark from review-notes/logo/final: two angle brackets, a crown and a T, drawn in one colour.
export interface BrandMarkProps {
  className?: string | undefined
  /** A colour for the image routes, which have no CSS; the page leaves it out and the mark takes currentColor. */
  color?: string | undefined
  size?: number | string | undefined
}

export function BrandMark({ className, color = 'currentColor', size = '1em' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false" className={className}>
      <g fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="19,15 7,32 19,49" />
        <polyline points="45,15 57,32 45,49" />
      </g>
      <path d="M24 12 L28 15 L32 9 L36 15 L40 12 V17 H24 Z" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <rect x="21" y="21" width="22" height="6" rx="3" fill={color} />
      <rect x="29" y="21" width="6" height="29" rx="3" fill={color} />
    </svg>
  )
}

/** The mark on the primary tile, as the navbar, the footer and the product frame draw it. */
export function BrandTile({ className = 'size-6' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-chip bg-primary-solid text-primary-on-solid ${className}`}>
      <BrandMark size="70%" />
    </span>
  )
}
