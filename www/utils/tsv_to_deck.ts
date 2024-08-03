import { fromArray } from '@bpev/flashcards/adapters/array'
import basic from '@bpev/flashcards/schedulers/basic'

// Basically adapters/tsv, but...
// 1. Fill missing values with ""
// 2. Add an index, to help with matching to audio
export default function tsvToDeck(tsv: string): Deck {
  const [fieldRow, ...cardRows] = tsv.split('\n')
  const fields = fieldRow.split('\t')
  return fromArray(
    cardRows.map((row, index) => {
      const values = row.split('\t')
      return fields
        .map((_key, index) => values[index] || '')
        .concat([index])
    }),
    basic,
    { fields: fields.concat(['index']) },
  )
}
