import { walk } from "jsr:@std/fs"
import Kuroshiro from "npm:kuroshiro"
import KuromojiAnalyzer from 'npm:kuroshiro-analyzer-kuromoji'

const kuroshiro = new (Kuroshiro.default)()
await kuroshiro.init(new KuromojiAnalyzer())

const kanjiIndex = 3
const furiganaIndex = 4

for await (const entry of walk(".")) {
  if (entry.isDirectory || entry.isSymlink) continue
  if (!/^week.*\.json$/.test(entry.path)) continue
  const text = await Deno.readTextFile(entry.path)
  const deck = JSON.parse(text)

  for (let i = 0; i < deck.notes.length; i++) {
    const note = deck.notes[i]
    if (!note[kanjiIndex] || note[furiganaIndex]) continue
    note[furiganaIndex] = await kuroshiro.convert(note[kanjiIndex], {
      mode: 'furigana',
      to: 'hiragana'
    })
  }

  await Deno.writeTextFile(entry.path, text)
}
