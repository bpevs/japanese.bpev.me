import { createEffect, createMemo, createResource, createSignal } from 'solid-js'
import fromTsv from '$/utils/tsv_to_deck.ts'
import basic from '@bpev/flashcards/schedulers/basic'
import { Howl } from 'howler'
import deckToSprites from '$/utils/deck_to_sprites.ts'

export default function useDeck({
  audioURL,
  deckURL,
  scheduler = basic,
}) {
  const [loaded, setLoaded] = createSignal(false)
  const [currCard, setCurrCard] = createSignal(null)

  const [deck] = createResource(deckURL, async () => {
    return fromTsv(await (await fetch(deckURL)).text(), scheduler)
  })

  createEffect(() => {
    if (deck.loading) return null
    setCurrCard(deck().getNext(1)[0])
    setLoaded(true)
  })

  const howl = createMemo(() => {
    if (!deck.loading) {
      return new Howl({
        src: [audioURL],
        sprite: deckToSprites('kana', deck()),
      })
    }
  })

  return {
    deck,
    loaded,
    currCard,
    setCurrCard,
    playAudio: (key: string) => {
      if (howl()) howl().play(key)
    },
  }
}
