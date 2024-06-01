import { DeckObj } from '@flashcard/adapters'

interface Sprite {
  [name: string]: [ number, number ]
}

const clipLength = 2000

export default function deckToAudiomap(key: string, deck: DeckObj): {
  sprite: Sprite
} {
  const sprite: Sprite = {}
  const nameIndex = deck.fields.indexOf(key)

  deck.notes.forEach((card: string[], index) => {
    const timeStart = index * clipLength
    const name = card[nameIndex]
    sprite[name] = [startTime, startTime + clipLength]
  })

  return sprite
}
