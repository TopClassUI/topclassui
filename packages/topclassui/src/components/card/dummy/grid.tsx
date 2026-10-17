import { CardBody, CardHeader, CardRoot } from '../index.js'

/** Three cards in a grid: each takes the width of its cell and the height of its row. */
export default function Demo() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <CardRoot>
        <CardHeader>
          <h2>Starter</h2>
        </CardHeader>
        <CardBody>One project and 5 GB of storage.</CardBody>
      </CardRoot>
      <CardRoot>
        <CardHeader>
          <h2>Team</h2>
        </CardHeader>
        <CardBody>Ten projects, 50 GB of storage and a shared library for the whole team.</CardBody>
      </CardRoot>
      <CardRoot>
        <CardHeader>
          <h2>Business</h2>
        </CardHeader>
        <CardBody>Unlimited projects and single sign-on.</CardBody>
      </CardRoot>
    </div>
  )
}
