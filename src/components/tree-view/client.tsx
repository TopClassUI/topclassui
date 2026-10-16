'use client'

import { caretDown } from '#icons/data/caret-down.js'
import { caretRight } from '#icons/data/caret-right.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import {
  TREE_VIEW_CARET, TREE_VIEW_ICON, TREE_VIEW_LABEL, TREE_VIEW_NOTE, TREE_VIEW_ROOT, TREE_VIEW_ROW, TREE_VIEW_ROW_ACTIVE,
  TREE_VIEW_ROW_DISABLED, TREE_VIEW_ROW_SELECTED, TREE_VIEW_TREE,
} from './classes.js'
import { useTreeView } from './hook.js'
import type { TreeViewProps } from './types.js'

/** A tree whose open branches flatten into one windowed list. The tree is the one tab stop and keeps the focus; the
 * keys move a highlight that aria-activedescendant names, so windowing can never drop the focus (choice 27). */
export function TreeView({
  items, value, defaultValue, onValueChange, expanded, defaultExpanded, onExpandedChange, visibleRows, virtualize, hasMore,
  loadMore, loadMoreThreshold, status, loadingFallback, emptyFallback, className, style, ref, onKeyDown, onFocus, onBlur,
  onPointerDown, onPointerUp, onPointerCancel, onClick, ...rest
}: TreeViewProps) {
  const tree = useTreeView({
    items, value, defaultValue, onValueChange, expanded, defaultExpanded, onExpandedChange, visibleRows, virtualize,
    hasMore, loadMore, loadMoreThreshold, status, loadingFallback, emptyFallback, ref, style, onKeyDown, onFocus, onBlur,
    onPointerDown, onPointerUp, onPointerCancel, onClick,
  })
  return (
    <div className={TREE_VIEW_ROOT}>
      <div
        {...rest}
        ref={tree.treeRef}
        role="tree"
        tabIndex={tree.tabIndex}
        aria-activedescendant={tree.activeDescendant}
        aria-busy={tree.busy}
        data-highlight-hidden={tree.outOfView ? '' : undefined}
        style={tree.style}
        className={cn(TREE_VIEW_TREE, className)}
        onKeyDown={tree.onKeyDown}
        onFocus={tree.onFocus}
        onBlur={tree.onBlur}
        onPointerDown={tree.onPointerDown}
        onPointerUp={tree.onPointerUp}
        onPointerCancel={tree.onPointerCancel}
        onClick={tree.onClick}
      >
        {tree.rows.map(({ item: row, index, key }) => (
          <div
            key={key}
            id={tree.idOf(index)}
            role="treeitem"
            data-index={index}
            aria-level={row.level}
            aria-setsize={row.setSize}
            aria-posinset={row.posInSet}
            aria-expanded={row.branch ? row.open : undefined}
            aria-selected={tree.selected === key}
            aria-disabled={row.node.disabled === true ? true : undefined}
            data-highlighted={tree.active === key ? '' : undefined}
            style={{ '--tc-tree-level': row.level - 1 }}
            className={cn(TREE_VIEW_ROW, TREE_VIEW_ROW_SELECTED, TREE_VIEW_ROW_ACTIVE, TREE_VIEW_ROW_DISABLED)}
          >
            <span aria-hidden="true" className={TREE_VIEW_CARET}>
              {row.branch ? <Svg icon={row.open ? caretDown : caretRight} size="0.875rem" /> : null}
            </span>
            {row.node.icon === undefined ? null : <span aria-hidden="true" className={TREE_VIEW_ICON}>{row.node.icon}</span>}
            <span dir="auto" className={TREE_VIEW_LABEL}>{row.node.label}</span>
          </div>
        ))}
      </div>
      <div role="status" className={TREE_VIEW_NOTE}>{tree.note}</div>
    </div>
  )
}
