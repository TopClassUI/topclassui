import { Breadcrumb } from '../index.js'

const STEPS = [
  'Company handbook for every regional office',
  'People, payroll and the benefits each country offers',
  'Leave, public holidays and working from another country',
  'Parental leave and the return-to-work arrangements',
  'Eligibility by contract type and length of service',
  'How to apply, and who approves the request',
  'Documents the payroll team needs before the first month',
  'Frequently asked questions from managers and their teams',
  'Changes made since the last review of this policy',
  'Country annexes and the local rules that override them',
  'Annex 7: the Gulf states and the wider Middle East',
  'Worked examples for a split leave across two tax years',
]

/** Twelve long crumbs and no box around them: on a phone each takes a row of its own
 * and ends in an ellipsis, so the page never scrolls sideways. */
export default function Demo() {
  return (
    <Breadcrumb
      items={STEPS.map((label, index) => (
        index === STEPS.length - 1 ? { label } : { href: `/handbook/step-${String(index + 1)}`, label }
      ))}
    />
  )
}
