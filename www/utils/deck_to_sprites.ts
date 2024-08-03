interface Sprites {
  [name: string]: [number, number]
}

const clipLength = 2000

export default function deckToSprites(key: string, deck: Deck): Sprites {
  if (!deck) return
  const sprites: Sprites = {}

  deck.cards.forEach((card: Card) => {
    const startTime = card.content.index * clipLength
    const name = card.content[key]
    sprites[name] = [startTime, clipLength]
  })

  return sprites
}
