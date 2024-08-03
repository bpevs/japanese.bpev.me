import basic from '@bpev/flashcards/schedulers/basic'
import fromTsv from '$/utils/tsv_to_deck.ts'
import { walk } from '@std/fs'
import Kuroshiro from 'kuroshiro'
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'

const kuroshiro = new (Kuroshiro.default)()
await kuroshiro.init(new KuromojiAnalyzer())

for await (const entry of walk('.')) {
  if (entry.isDirectory || entry.isSymlink) continue
  if (/\.tsv$/.test(entry.path) === false) continue

  const name = entry.path.split('/')[1]
  if (!name) continue

  const deckText = await Deno.readTextFile(entry.path)
  const deck = fromTsv(deckText, basic)

  const furiganaPath = `./tools/${name}/assets/furigana.json`
  const furigana = JSON.parse(await Deno.readTextFile(furiganaPath))

  for (let i = 0; i < deck.cards.length; i++) {
    const { kanji } = deck.cards[i].content || ''
    if (!kanji) continue
    furigana[kanji] = await kuroshiro.convert(kanji, {
      mode: 'furigana',
      to: 'hiragana',
    })
  }
  await Deno.writeTextFile(furiganaPath, JSON.stringify(furigana, null, 2) + '\n')
}
