'use client'

// The navbar's client parts, hydrated after the first paint: they are on screen from the start, so they wait for an idle moment instead of the viewport.
import { island } from '../lazy-island'

export const SearchButton = island(() => import('../search/search-button').then((m) => m.SearchButton), 'idle')
export const ModeSwitch = island(() => import('./mode-switch').then((m) => m.ModeSwitch), 'idle')
export const MobileMenu = island(() => import('./mobile-menu').then((m) => m.MobileMenu), 'idle')
export const SidebarRoot = island(() => import('topclassui/sidebar').then((m) => m.SidebarRoot))
