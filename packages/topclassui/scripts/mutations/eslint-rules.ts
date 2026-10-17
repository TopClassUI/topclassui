// The mutations of the custom lint rules under eslint-rules/. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the style rule stops caring what the property is called',
    file: 'eslint-rules/index.ts',
    from: "if (!name.startsWith('--tc-')) ctx.report({ node: prop, messageId: 'property', data: { name } })",
    to: "if (false) ctx.report({ node: prop, messageId: 'property', data: { name } })",
  },
  {
    label: 'the label rule stops recognising prose',
    file: 'eslint-rules/index.ts',
    from: 'const isProse = (text: string) => /[A-Za-z]{2,}/.test(text)',
    to: 'const isProse = (text: string) => text === String(Symbol())',
  },
  {
    label: 'data-state stops being reported, so Base UI grammar leaks in',
    file: 'eslint-rules/index.ts',
    from: "if (name === 'data-state') {",
    to: "if (false) {",
  },
  {
    label: 'eslint stops reading the named colours, so bg-[red] passes R-5.2-1',
    file: 'eslint-rules/index.ts',
    from: "if (NAMED_COLORS.has(value) || value.startsWith('#') || COLOR_FUNCTION.test(value)) return 'arbitrary'",
    to: "if (value.startsWith('#') || COLOR_FUNCTION.test(value)) return 'arbitrary'",
  },
  {
    label: 'eslint accepts a system colour with no forced-colors variant, so bg-[CanvasText] passes anywhere',
    file: 'eslint-rules/index.ts',
    from: "if (kind === 'system' && variants.includes('forced-colors')) continue",
    to: "if (kind === 'system') continue",
  },
  {
    label: 'eslint lets forced-colors exempt any colour, so forced-colors:bg-[red] passes',
    file: 'eslint-rules/index.ts',
    from: "if (kind === 'system' && variants.includes('forced-colors')) continue",
    to: "if (variants.includes('forced-colors')) continue",
  },
  {
    label: 'the tooltip rule stops looking inside expressions, so {ok && <a />} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: 'const hit = findHidden(child)',
    to: 'const hit = null',
  },
  {
    label: 'the tooltip rule forgets fragments, so <><a /></> passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (node.type === 'JSXElement' || node.type === 'JSXFragment') return node",
    to: "if (node.type === 'JSXElement') return node",
  },
  {
    label: 'the tooltip rule forgets renamed imports, so <Tip><a /></Tip> passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: 'if (names.has(imported)) names.add(local)',
    to: 'if (false) names.add(local)',
  },
  {
    label: 'the tooltip rule ignores the children prop, so children={<a />} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (prop === 'children' || prop === 'render') flag(attribute.value, name)",
    to: "if (prop === 'render') flag(attribute.value, name)",
  },
  {
    label: 'the tooltip rule ignores the render prop, so render={<a />} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (prop === 'children' || prop === 'render') flag(attribute.value, name)",
    to: "if (prop === 'children') flag(attribute.value, name)",
  },
  {
    label: 'the tooltip rule ignores a spread, so {...{ children: <a /> }} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (attribute.type === 'JSXSpreadAttribute') flag(attribute.argument, name)",
    to: "if (false) flag(attribute.argument, name)",
  },
  {
    label: 'the tooltip rule allows dangerouslySetInnerHTML, so markup passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (prop === 'dangerouslySetInnerHTML') ctx.report",
    to: "if (false) ctx.report",
  },
  {
    label: 'the tooltip rule lets a cast through, so {link as unknown as string} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: 'if (isCast(node)) return node',
    to: 'if (false) return node',
  },
  {
    label: 'the tooltip rule counts as const as a cast, so {"Copy" as const} fails R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: '&& !isConst(node)',
    to: '',
  },
  {
    label: 'the tooltip rule forgets Base UI\'s Tooltip, so <Tooltip.Popup><a /></Tooltip.Popup> passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (fromBase && imported === 'Tooltip') bases.add(local)",
    to: "if (false) bases.add(local)",
  },
  {
    label: 'the tooltip rule forgets namespace imports, so <B.Tooltip.Viewport><a /></B.Tooltip.Viewport> passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (fromBase && specifier.type === 'ImportNamespaceSpecifier') roots.add(local)",
    to: "if (false) roots.add(local)",
  },
  {
    label: 'the tooltip rule treats any Popup as a tooltip, so Popover\'s <Base.Popup><a /></Base.Popup> fails R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "const fromBase = SOURCES.has(String(node.source?.value))",
    to: "const fromBase = true",
  },
  {
    label: 'the tooltip rule flags the arrow, so the component\'s own <Base.Arrow /> fails R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (child.type === 'JSXElement' && basePart(child.openingElement?.name) === 'Arrow') continue",
    to: "",
  },
]
