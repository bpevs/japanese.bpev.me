interface Sprites {
  [name: string]: [number, number]
}

const clipLength = 2000

export default function deckToSprites(key: string, deck): Sprites {
  if (!deck) return
  const sprites: Sprites = {}
  const nameIndex = deck.fields.indexOf(key)

  deck.notes.forEach((card: string[], index) => {
    const startTime = index * clipLength
    const name = card[nameIndex]
    sprites[name] = [startTime, clipLength]
  })

  return sprites
}
