import { createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { Deck } from '@bpev/flashcards'
import basic from '@bpev/flashcards/schedulers/basic'
import { Howl } from 'howler'
import deckToSprites from '$/utils/deck_to_sprites.ts'

export default function useDeck({
  audioURL,
  deckURL,
  filter = (i) => Boolean(i),
  scheduler = basic,
}) {
  let deck
  const [loaded, setLoaded] = createSignal(false)
  const [currCard, setCurrCard] = createSignal(null)

  const [data] = createResource(deckURL, async () => {
    const resp = await fetch(deckURL)
    const data = await resp.json()
    return data
  })
  createEffect(() => {
    if (data.loading) return null
    deck = new Deck(scheduler)
    data().notes.forEach((note) => {
      const [image, kana] = note
      if (filter(note)) deck.addCard(kana, { image, kana })
    })
    setCurrCard(deck.getNext(1)[0])
    setLoaded(true)
  })

  const howl = createMemo(() => {
    if (!data.loading) {
      return new Howl({
        src: [audioURL],
        sprite: deckToSprites('kana', data()),
      })
    }
  })

  return {
    deck: () => deck,
    loaded,
    currCard,
    setCurrCard,
    playAudio: (key: string) => {
      if (howl()) howl().play(key)
    },
  }
}
