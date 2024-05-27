import { createSignal, Show } from 'solid-js'
import Readme from './readme.tsx'

const README = '#readme'
const EXERCISE = '#exercise'

export default function Page({ week, children }) {
  const [tab, setTab] = createSignal(
    [README, EXERCISE].includes(location.hash.toLowerCase()) ? location.hash.toLowerCase() : README,
  )

  return (
    <div>
      <nav class='ph3 ph4-m ph5-l pb3 pb4-ns bg-black-90'>
        <div
          class={`link dim white b f6 f5-ns dib mr3` +
            ((tab() === README) ? ' underline' : '')}
          onClick={() => {
            setTab(README)
            location.hash = README
          }}
        >
          readme
        </div>
        <div
          class={`link dim white b f6 f5-ns dib mr3` +
            ((tab() === EXERCISE) ? ' underline' : '')}
          onClick={() => {
            setTab(EXERCISE)
            location.hash = EXERCISE
          }}
        >
          exercises
        </div>
      </nav>
      <Show when={tab() === README}>
        <Readme week={week} />
      </Show>
      <Show when={tab() === EXERCISE}>
        {children}
      </Show>
    </div>
  )
}
