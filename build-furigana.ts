import { walk } from 'jsr:@std/fs'
import Kuroshiro from 'npm:kuroshiro'
import KuromojiAnalyzer from 'npm:kuroshiro-analyzer-kuromoji'

const kuroshiro = new (Kuroshiro.default)()
await kuroshiro.init(new KuromojiAnalyzer())

for await (const entry of walk('.')) {
  if (entry.isDirectory || entry.isSymlink) continue
  if (/furigana\.json/.test(entry.path)) continue

  const week = entry.path.match(/^(week-\d+)\/.*\.json$/)?.[1]
  if (!week) continue

  const deck = JSON.parse(await Deno.readTextFile(entry.path))

  const furiganaPath = `./${week}/assets/furigana.json`
  const furigana = JSON.parse(await Deno.readTextFile(furiganaPath))

  for (let i = 0; i < deck.notes.length; i++) {
    const kanjiIndex = deck.fields.indexOf('kanji')
    const note = deck.notes[i]
    if (!note[kanjiIndex]) continue
    furigana[note[kanjiIndex]] = await kuroshiro.convert(note[kanjiIndex], {
      mode: 'furigana',
      to: 'hiragana',
    })
  }

  await Deno.writeTextFile(furiganaPath, JSON.stringify(furigana, null, 2))
}
