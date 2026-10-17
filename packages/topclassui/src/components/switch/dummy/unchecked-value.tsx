import { Switch } from '../index.js'

/** A switch that is off still sends a value: Base UI adds an input of type hidden beside it. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2">
        <Switch id="switch-unchecked-news" name="news" value="yes" uncheckedValue="no" />
        <label htmlFor="switch-unchecked-news" className="text-sm text-body">Product news</label>
      </div>
    </form>
  )
}
