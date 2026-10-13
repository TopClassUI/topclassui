// R-5.1-2: re-exports only, as flat names (R-9.2-3); every part lives in client.tsx.
export {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from './client.js'
export type {
  DrawerBodyProps, DrawerCloseProps, DrawerDescriptionProps, DrawerDesignProps, DrawerFooterProps,
  DrawerHeaderProps, DrawerPlacement, DrawerPopupProps, DrawerRootProps, DrawerTitleProps, DrawerTriggerProps,
} from './types.js'
