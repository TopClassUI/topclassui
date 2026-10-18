// R-5.7-3: every folder carries the fixture src/test/root-props.dom.test.tsx renders its exports with.

/** Where the fixture lives, relative to the component folder. */
export const ROOT_PROPS_FIXTURE = 'test/fixture.ts'

/** The check-structure error for a folder whose test/ lacks the fixture, or null when it has one. */
export function missingFixture(folder: string, testFiles: readonly string[]): string | null {
  if (testFiles.includes('fixture.ts')) return null
  return `${folder}: ${ROOT_PROPS_FIXTURE} is required: the required props of each export, which the root-props test renders (R-5.7-3).`
}
