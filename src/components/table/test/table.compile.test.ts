import { join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'table')

/** TypeScript hands the host forward slashes on every platform, so compare those. */
const slash = (path: string) => path.replace(/\\/g, '/')
const probePath = (name: string) => slash(join(FOLDER, 'test', `table-probe-${name}.tsx`))

const PRELUDE = [
  "import { Table, TableSkeleton } from '../index.js'",
  'interface Invoice { id: string; number: string; amount: number }',
  'interface Customer { name: string }',
  "const invoices: Invoice[] = [{ id: 'a', number: 'INV-1', amount: 120 }]",
  'declare const admin: boolean',
  'declare const title: string',
  'declare const maybe: string | undefined',
  'void [Table, TableSkeleton, invoices, {} as Customer, admin, title, maybe]',
].join('\n')

/**
 * The compiler's verdict, read at runtime: a type assertion erases before Vitest runs, so
 * no mutation could reach it. Only the probes are roots, as in a consumer's own program.
 */
function compile(snippets: Record<string, string>): Record<string, string[]> {
  const read = ts.readConfigFile(join(ROOT, 'tsconfig.json'), ts.sys.readFile.bind(ts.sys))
  const options = { ...ts.parseJsonConfigFileContent(read.config ?? {}, ts.sys, ROOT).options, noEmit: true }
  const probes = new Map(Object.entries(snippets).map(([name, code]) =>
    [probePath(name), `${PRELUDE}\n${code}\n`]))

  const host = ts.createCompilerHost(options)
  const getSourceFile = host.getSourceFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  const readFile = host.readFile.bind(host)
  host.getSourceFile = (name, language, ...rest) => {
    const code = probes.get(slash(name))
    return code === undefined ? getSourceFile(name, language, ...rest) : ts.createSourceFile(name, code, language)
  }
  host.fileExists = (name) => probes.has(slash(name)) || fileExists(name)
  host.readFile = (name) => probes.get(slash(name)) ?? readFile(name)

  const program = ts.createProgram([...probes.keys()], options, host)
  const out: Record<string, string[]> = {}
  for (const name of Object.keys(snippets)) {
    out[name] = ts.getPreEmitDiagnostics(program, program.getSourceFile(probePath(name)))
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))
  }
  return out
}

/** One table with the part under test swapped in, so every probe differs by one thing. */
const table = (columns: string, rest = "caption='Invoices' getKey={(invoice) => invoice.id}") =>
  `export const probe = <Table items={invoices} ${rest} columns={[${columns}]} />`

/** The one column most probes share: they differ in what stands beside it. */
const ONE = "{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }"

const verdict = compile({
  inferred: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }"),
  missingField: table("{ key: 'total', header: 'Total', cell: (invoice) => invoice.total }"),
  otherItem: table("{ key: 'name', header: 'Name', cell: (customer: Customer) => customer.name }"),
  objectCell: table("{ key: 'all', header: 'All', cell: (invoice) => invoice }"),
  secondArgument: table("{ key: 'row', header: 'Row', cell: (invoice: Invoice, index: number) => index }"),
  noCell: table("{ key: 'number', header: 'Invoice' }"),
  physicalAlign: table("{ key: 'amount', header: 'Amount', align: 'right', cell: (invoice) => invoice.amount }"),
  logicalAlign: table("{ key: 'amount', header: 'Amount', align: 'end', sortHref: '?sort=amount', cell: (invoice) => invoice.amount }"),
  objectKey: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }", "caption='Invoices' getKey={(invoice) => invoice}"),
  noCaption: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }", 'getKey={(invoice) => invoice.id}'),
  nullCaption: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }", 'caption={null} getKey={(invoice) => invoice.id}'),
  shortDirection: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }", "caption='Invoices' getKey={(invoice) => invoice.id} sort={{ key: 'number', direction: 'asc' }}"),
  sorted: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }", "caption='Invoices' getKey={(invoice) => invoice.id} sort={{ key: 'number', direction: 'ascending' }}"),
  role: table("{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }", "caption='Invoices' getKey={(invoice) => invoice.id} role='presentation'"),
  child: `export const probe = <Table items={invoices} caption='Invoices' getKey={(invoice) => invoice.id} columns={[]}>Hello</Table>`,
  numberKey: table(ONE, "caption='Invoices' getKey={(invoice) => invoice.amount}"),
  emptyCaption: table(ONE, "caption='' getKey={(invoice) => invoice.id}"),
  stringCaption: table(ONE, 'caption={title} getKey={(invoice) => invoice.id}'),
  nodeCaption: table(ONE, 'caption={<strong>Invoices</strong>} getKey={(invoice) => invoice.id}'),
  maybeCaption: table(ONE, 'caption={maybe} getKey={(invoice) => invoice.id}'),
  falsyColumns: table(`admin && { key: 'id', header: 'Id', cell: (invoice) => invoice.id }, null, undefined, ${ONE}`),
  columnProps: table("{ key: 'number', header: 'Invoice', rowHeader: true, className: 'min-w-40 whitespace-normal', cell: (invoice) => invoice.number }"),
  unknownColumnProp: table("{ key: 'number', header: 'Invoice', width: 160, cell: (invoice) => invoice.number }"),
  centredColumn: table("{ key: 'number', header: 'Invoice', align: 'center', cell: (invoice) => invoice.number }"),
  link: table(ONE, "caption='Invoices' getKey={(invoice) => invoice.id} link={<a rel='nofollow' />}"),
  stringLink: table(ONE, "caption='Invoices' getKey={(invoice) => invoice.id} link='a'"),
  renderProp: table(ONE, "caption='Invoices' getKey={(invoice) => invoice.id} render={<section />}"),
  skeleton: 'export const probe = <TableSkeleton rows={3} columns={4} captionVisible className="mt-4" />',
  skeletonString: "export const probe = <TableSkeleton rows='3' />",
  skeletonChild: 'export const probe = <TableSkeleton>Loading</TableSkeleton>',
  stickyWidth: table(ONE, "caption='Revenue by region' getKey={(invoice) => invoice.id} stickyFirstColumn style={{ '--tc-table-sticky-width': '20rem' }}"),
  readonlyItems: "const frozen = [{ id: 'a' }, { id: 'b' }] as const\nexport const probe = <Table items={frozen} caption='Letters' getKey={(letter) => letter.id} columns={[{ key: 'id', header: 'Id', cell: (letter) => letter.id }]} />",
})

const said = (name: string) => (verdict[name] ?? ['the probe did not compile at all']).join(' ')

describe('the item type is inferred from items and reaches every column', () => {
  it('compiles a table whose cell and getKey read the item with no annotation', () => {
    expect(verdict['inferred']).toEqual([])
  })

  it('accepts a readonly list, and narrows the cell to its literal item', () => {
    expect(verdict['readonlyItems']).toEqual([])
  })

  it('refuses a cell that reads a field the item does not have', () => {
    // The message, not a count: a program that fails for any other reason also has errors.
    expect(said('missingField')).toContain("Property 'total' does not exist on type 'Invoice'")
  })
})

describe('the --tc-* style keys reach a program that compiles only Table', () => {
  it('compiles the sticky width the README raises through style', () => {
    expect(verdict['stickyWidth']).toEqual([])
  })
})

describe('a wrong cell signature is rejected', () => {
  it('refuses a cell written for another item type', () => {
    expect(said('otherItem')).toContain("Property 'name' is missing in type 'Invoice' but required in type 'Customer'")
  })

  it('refuses a cell that returns an object React cannot render', () => {
    expect(said('objectCell')).toContain("Type 'Invoice' is not assignable to type 'ReactNode'")
  })

  it('refuses a cell that asks for a second argument the table never passes', () => {
    expect(said('secondArgument')).toContain('Target signature provides too few arguments. Expected 2 or more, but got 1')
  })

  it('refuses a column with no cell at all', () => {
    expect(said('noCell')).toContain("Property 'cell' is missing")
  })
})

describe('the rest of the contract', () => {
  it('refuses a physical alignment and accepts a logical one beside a sort link', () => {
    expect(said('physicalAlign')).toContain('Type \'"right"\' is not assignable to type \'"start" | "end" | undefined\'')
    expect(verdict['logicalAlign']).toEqual([])
  })

  it('refuses a getKey that returns the item or a number: the shared collection contract keys by string', () => {
    expect(said('objectKey')).toContain("Type 'Invoice' is not assignable to type 'string'")
    expect(said('numberKey')).toContain("Type 'number' is not assignable to type 'string'")
  })

  it('refuses a table with no caption, and one whose caption is null or may be undefined', () => {
    expect(said('noCaption')).toContain("Property 'caption' is missing")
    expect(said('nullCaption')).toContain("Type 'null' is not assignable to type")
    expect(said('maybeCaption')).toContain("Type 'undefined' is not assignable to type")
  })

  it('refuses the empty string as a caption, which would leave the table and its region unnamed', () => {
    expect(said('emptyCaption')).toContain("Type 'string' is not assignable to type 'never'")
  })

  it('accepts a caption that is a string variable or an element', () => {
    expect(verdict['stringCaption']).toEqual([])
    expect(verdict['nodeCaption']).toEqual([])
  })

  it('refuses a sort direction aria-sort does not know, and accepts the two it does', () => {
    expect(said('shortDirection')).toContain('Type \'"asc"\' is not assignable to type \'"ascending" | "descending"\'')
    expect(verdict['sorted']).toEqual([])
  })

  it('accepts false, null and undefined among the columns, with the cell of a conditional one still inferred', () => {
    expect(verdict['falsyColumns']).toEqual([])
  })

  it('accepts rowHeader and className on a column, and refuses a prop a column does not have', () => {
    expect(verdict['columnProps']).toEqual([])
    expect(said('unknownColumnProp')).toContain("'width' does not exist in type")
    expect(said('centredColumn')).toContain(`Type '"center"' is not assignable to type`)
  })

  it('takes the sort link as an element named link, never as a string and never as render', () => {
    expect(verdict['link']).toEqual([])
    expect(said('stringLink')).toContain("Type 'string' is not assignable to type 'ReactElement")
    expect(said('renderProp')).toContain("Property 'render' does not exist")
  })

  it('types the placeholder: two numbers, no children', () => {
    expect(verdict['skeleton']).toEqual([])
    expect(said('skeletonString')).toContain("Type 'string' is not assignable to type 'number'")
    expect(said('skeletonChild')).toContain("Type '{ children: string; }' has no properties in common with type")
  })

  it('refuses role, which is always region, and children, because the rows come from items', () => {
    expect(said('role')).toContain("Property 'role' does not exist")
    expect(said('child')).toContain("Property 'children' does not exist")
  })
})
