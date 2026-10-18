import type { PageGroup } from '../content/pages'

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
    notFoundTitle: string
  }
  shell: {
    skip: string
    siteNav: string
    sidebarTitle: string
    onThisPage: string
    next: string
    home: string
    breadcrumb: string
    menu: string
    github: string
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
  }
  blocks: {
    wrong: string
    right: string
    terminal: string
    packageManagers: string
    framework: string
    utilities: { token: string; utilities: string }
    props: { prop: string; type: string; default: string; description: string; required: string }
    csp: string
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
    }
    frame: {
      caption: string
      sidebar: readonly string[]
      title: string
      count: (components: number) => string
      search: string
      filter: string
      add: string
      columns: { component: string; kind: string; js: string; status: string; updated: string }
      kinds: Record<Rendering, string>
      notMeasured: string
      beta: string
      showing: (from: number, to: number, total: number) => string
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
        notMeasured: string
        tree: string
        treeSummary: (server: number, client: number) => string
      }
      rtl: {
        title: string
        lead: string
        grid: string
        gridNote: (modes: number, directions: number) => string
        note: string
        sample: string
      }
      tested: {
        title: string
        lead: string
        axe: (pages: number) => string
        target: (pages: number) => string
        focus: (pages: number) => string
        contrast: (pairs: number) => string
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
    install: Titled & {
      card: string
      note: string
      once: string
    }
    need: Titled & {
      next: { name: string; line: string }
      react: { name: string; line: string }
      tailwind: { name: string; line: string }
    }
  }
}
