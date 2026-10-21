import type { PageGroup } from '../content/pages'
import type { SearchGroup } from '../scripts/lib/search'

export type Rendering = 'server' | 'split' | 'client'
export type Mode = 'light' | 'dark' | 'ocean'

interface Titled {
  eyebrow: string
  title: string
  lead: string
}

/** Every string the site writes outside its MDX (docs-site rule 7). A count is a function. */
export interface SiteLabels {
  meta: {
    siteName: string
    homeTitle: string
    guideTitle: (title: string) => string
    /** Tails a component's lead may take to reach 120 to 160 characters, shortest first; the longest that fits is used. */
    componentTails: readonly string[]
    /** The og:image:alt of a page's card. */
    ogAlt: (title: string) => string
    notFoundTitle: string
  }
  shell: {
    skip: string
    siteNav: string
    /** The navbar's links, named apart from the Sidebar and from every Navbar demo's default "Main". */
    sectionsNav: string
    sidebarTitle: string
    onThisPage: string
    next: string
    previous: string
    /** The nav holding the Previous and Next cards. */
    pager: string
    home: string
    breadcrumb: string
    menu: string
    /** The navbar's first link, short: "Docs". */
    docs: string
    github: string
    youtube: string
    groups: Record<PageGroup, string>
    anchor: (heading: string) => string
  }
  mode: Record<Mode, string> & { label: string }
  language: { label: string }
  footer: {
    tagline: string
    blurb: (components: number) => string
    license: string
    wcag: string
    version: (version: string, beta: boolean) => string
    columns: Record<PageGroup, string>
    bottom: string
    install: string
    llms: string
    social: string
    cli: string
    all: (components: number) => string
  }
  blocks: {
    wrong: string
    right: string
    terminal: string
    /** The header of a fence with no file name and no language. */
    code: string
    /** The word on a code block's copy button. */
    copy: string
    packageManagers: string
    framework: string
    utilities: { token: string; utilities: string; through: string }
    props: { prop: string; type: string; default: string; description: string; required: string }
    /** Read after a code title the page shows again: ", version 2". */
    repeat: (count: number) => string
  }
  /** "What it does" for each prop of TopClassProvider; a test holds the keys to the provider's own props. */
  providerProps: Record<string, string>
  notFound: {
    title: string
    lead: string
    home: string
    components: string
  }
  home: {
    hero: {
      chip: (version: string, beta: boolean) => string
      titleTop: string
      titleBottom: string
      lead: string
      readDocs: string
      star: string
      /** The line under the calls to action: where the release is and what to read first. */
      caption: (version: string, beta: boolean) => string
    }
    frame: {
      caption: string
      sidebar: readonly string[]
      title: string
      count: (components: number) => string
      search: string
      filter: string
      add: string
      columns: { component: string; name: string; js: string; status: string; updated: string; actions: string }
      kinds: Record<Rendering, string>
      showing: (from: number, to: number, total: number) => string
      perPage: (rows: number) => string
      toast: { title: string; body: string; close: string }
    }
    proof: Titled & {
      server: {
        title: string
        lead: (server: number, total: number) => string
        invoice: string
        paid: string
        issued: string
        amount: string
        download: string
        void: string
        voidTitle: string
        voidBody: string
        keep: string
        clientNote: string
        border: string
        onServer: string
        inBrowser: string
        inBrowserSize: (size: string) => string
        checkTitle: string
        checkNote: string
        tree: string
        treeServer: (server: number) => string
        treeClient: (client: number) => string
      }
      rtl: {
        title: string
        lead: string
        grid: (pages: number) => string
        gridNote: (modes: number, directions: number) => string
        note: string
        sample: string
        checked: string
      }
      tested: {
        title: string
        lead: string
        axe: (pages: number) => string
        target: (pages: number) => string
        focus: (pages: number) => string
        contrast: (pairs: number) => string
        /** The heading over the commands that run the checks above. */
        run: string
        /** The comment above each command in the code well, without its #. */
        commands: { setup: string; e2e: string; contrast: (pairs: number) => string; all: string }
        runNote: string
      }
    }
    modes: Titled & {
      email: string
      save: string
      cancel: string
      paid: string
      pending: string
      overdue: string
      digest: string
      caption: string
    }
    numbers: Titled & {
      components: string
      icons: (flip: number) => string
      pages: string
      zero: string
    }
    catalog: Omit<Titled, 'title'> & {
      title: (components: number) => string
      open: string
      badges: Record<Rendering, string>
    }
    follow: Titled & {
      github: Social
      youtube: Social
      x: Social
    }
    install: Titled & {
      copy: { title: string; note: string }
      import: { title: string; note: string }
    }
    need: Titled & {
      next: { name: string; line: string }
      react: { name: string; line: string }
      tailwind: { name: string; line: string }
    }
  }
  /** The catalog (page 13). */
  catalog: CatalogLabels
  /** The search button and its palette (S5). */
  search: SearchLabels
  /** The headings of /llms.txt (S6); the summary is English, as the file's readers are. */
  llms: LlmsLabels
}

export interface CatalogLabels {
  title: string
  lead: (count: number) => string
  description: string
  beforeTitle: string
  beforeOnce: string
  beforeLead: string
  /** Figma's four steps; the comment line is step 1's, between the install and the add command. */
  steps: { install: StepLabels; css: StepLabels; layout: StepLabels; source: StepLabels; addComment: string }
  legendTitle: string
  legendLead: string
  legend: { title: string; text: string }[]
  sectionCount: (n: number) => string
  startHere: string
  sectionsHeading: string
  installHeading: string
}

interface Social { name: string; line: string; action: string }

interface StepLabels { title: string; note: string }

export interface SearchLabels {
  button: string
  /** The palette's dialog title, which names it. */
  title: string
  placeholder: string
  groups: Record<SearchGroup, string>
  shortcut: { pc: string; mac: string }
  /** The key hint on the active row, as frame 138:1653 draws it. */
  enter: string
  empty: string
  loading: string
}

export interface LlmsLabels { summary: string; docs: string; components: string; keyboard: string; accessibility: string; rtl: string }
