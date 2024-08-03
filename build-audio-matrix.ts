import basic from '@bpev/flashcards/schedulers/basic'
import { Column, stringify } from '@std/csv/stringify'
import { walk } from '@std/fs'
import fromTsv from '$/utils/tsv_to_deck.ts'

for await (const entry of walk('.')) {
  if (entry.isDirectory || entry.isSymlink) continue
  if (/\.tsv?/.test(entry.path) === false) continue

  const name = entry.path.match(/^.*\/(.*)\.tsv$/)?.[1]
  if (!name) continue

  const deckText = await Deno.readTextFile(entry.path)
  const deckData = fromTsv(deckText, basic)

  await Deno.writeTextFile(
    entry.path
      .replace('flashcards', 'matrix')
      .replace('tsv', 'csv'),
    formatDeckToAudioRegions(deckData),
  )
}

interface Region {
  '#': number
  name: string
  start: string
  end: string
  length: string
}

function formatDeckToAudioRegions(deck: Deck) {
  const AUDIO_LENGTH_S = 1
  let start = 1
  const regions: regionArr = deck.cards.map((card, index): Region => {
    if (index) start += AUDIO_LENGTH_S
    const end = start + AUDIO_LENGTH_S

    return {
      '#': `R${index}`,
      name: card.content.kana,
      start: `${start}.1.00`,
      end: `${end}.1.00`,
      length: `${AUDIO_LENGTH_S}.0.00`,
    }
  })

  const columns: Column[] = ['#', 'name', 'start', 'end', 'length']

  return stringify(regions, { columns })
}
