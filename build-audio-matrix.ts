import { Column, stringify } from '@std/csv/stringify'
import { walk } from '@std/fs'

for await (const entry of walk('.')) {
  if (entry.isDirectory || entry.isSymlink) continue
  if (/furigana\.json/.test(entry.path)) continue
  if (/matrix.*\.json/.test(entry.path)) continue

  const week = entry.path.match(/^(week-\d+)\/.*\.json$/)?.[1]
  if (!week) continue

  const deckText = await Deno.readTextFile(entry.path)
  const deckData = JSON.parse(deckText)

  await Deno.writeTextFile(
    entry.path
      .replace('flashcards', 'matrix')
      .replace('json', 'csv'),
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

function formatDeckToAudioRegions({ fields, notes, meta }) {
  const { length = 1, primary } = meta
  const primaryIndex = fields.indexOf(primary)

  let start = 1
  const regions: regionArr = notes.map((note, index): Region => {
    if (index) start += length
    const end = start + length

    return {
      '#': `R${index}`,
      name: note[primaryIndex],
      start: `${start}.1.00`,
      end: `${end}.1.00`,
      length: `${length}.0.00`,
    }
  })

  const columns: Column[] = ['#', 'name', 'start', 'end', 'length']

  return stringify(regions, { columns })
}
