import { createSignal } from 'solid-js'

export default function Journal() {
  const [from, setFrom] = createSignal('')
  const [to, setTo] = createSignal('')

  const submit = () => {
    const segmenter = new Intl.Segmenter('ja-JP', { granularity: 'word' })
    const iterator1 = segmenter.segment(from())[Symbol.iterator]()
    const segItems = []
    for (const word of iterator1) {
      segItems.push(word.segment)
    }

    const segs = [...new Set(segItems)]
      .filter((segment) => !isSingleNonKanji(segment) && !isUnicodeNumber(segment))
    setTo(segs.join('\n'))
  }

  return (
    <article class='lh-copy measure pa2' style='margin: auto;'>
      <p>
        Create a list of words from a transcript! For example, take the output from{' '}
        <a href='https://youtubetotranscript.com'>youtubetotranscript.com</a>, put it in the textbox, then click "go",
        and get a list of vocabulary to study!
      </p>

      <textarea
        class='w-100'
        rows='20'
        onChange={(e) => setFrom(e.target.value)}
        value={from()}
      />
      <button class='ma2 f5' onClick={submit}>go</button>
      <pre class='ba bw1 br2 pa3 ma3 f3'>{to()}</pre>
    </article>
  )
}

function isSingleNonKanji(chars: string) {
  if (chars.length > 1) return false
  return !isKanji(chars)
}

export function isKanji(chars: string): boolean {
  return /^[\u4e00-\u9faf\u3400-\u4dbf]+$/.test(chars)
}

export function isKatakana(chars: string): boolean {
  return /^[\u30A0-\u30FF]+$/.test(chars)
}

export function isHiragana(chars: string): boolean {
  return /^[\u3040-\u309f]+$/.test(chars)
}

export function isPunctuation(chars: string): boolean {
  return /^[\u3000-\u303f]+$/.test(chars)
}

export function isUnicodeNumber(chars: string): boolean {
  return /^[０１２３４５６７８９　]+/.test(chars)
}
