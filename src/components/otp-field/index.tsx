// R-5.1-2: re-exports only, as a flat name (R-9.2-3); the field lives in client.tsx, its skeleton in skeleton.tsx.
export { OTPField } from './client.js'
export { OTPFieldSkeleton } from './skeleton.js'
export type {
  OTPFieldProps, OTPFieldSkeletonProps, OtpFieldDesignProps, OtpFieldName, OtpFieldProps, OtpFieldValidationType,
} from './types.js'
