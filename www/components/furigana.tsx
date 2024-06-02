import { createResource } from 'solid-js'

const cache = {}

export default function ({ children, week, showInitial = true }) {
  const [text] = createResource(children, async () => {
    if (!cache[week]) {
      const weekFurigana = await fetch(`/${week}/assets/furigana.json`)
      cache[week] = await weekFurigana.json()
    }
    return cache[week][children] || children
  })

  return <span innerHTML={(text.loading && showInitial) ? children() : (text() || '')} />
}
