import { Alert } from '../index.js'

/** The description is a div, so it holds paragraphs and a list as well as one sentence. */
export default function Demo() {
  return (
    <Alert tone="success" title="The import finished">
      <p>All 1,204 rows were read. Three were skipped:</p>
      <ul className="list-disc ps-5">
        <li>Row 18 has no email address.</li>
        <li>Row 311 repeats row 310.</li>
        <li>Row 902 has a date in the future.</li>
      </ul>
      <p>Fix them in the file and import it again.</p>
    </Alert>
  )
}
