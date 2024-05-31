import { createResource } from 'solid-js'

export default function ({ children, showInitial = true }) {
  const [text] = createResource(children, async () => {
    const kuroshiro = new Kuroshiro.default()
    await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/www/static/dict/' }))
    const text = await kuroshiro.convert(children(), { mode: 'furigana', to: 'hiragana' })
    return text
  })

  return <span innerHTML={(text.loading && showInitial) ? children() : (text() || '')} />
}
