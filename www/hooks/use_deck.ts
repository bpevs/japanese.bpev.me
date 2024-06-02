import { createEffect, createMemo, createResource, createSignal } from 'solid-js'
import { basic } from '@flashcard/schedulers'
import { fromOBJ } from '@flashcard/adapters'
import { Howl } from 'howler'
import deckToSprites from '$/utils/deck_to_sprites.ts'

export default function useFlashcards({
  audioURL,
  deckURL,
  filter = (i) => Boolean(i),
  sortField,
  scheduler = basic,
}) {
  let deck
  const [loaded, setLoaded] = createSignal(false)
  const [currCard, setCurrCard] = createSignal(null)

  const [data] = createResource(deckURL, async () => {
    const resp = await fetch(deckURL)
    return await resp.json()
  })

  createEffect(() => {
    if (data.loading) return null
    const currData = { ...data() }
    currData.notes = currData.notes.filter(filter)
    deck = fromOBJ(currData, { sortField })
    deck.addTemplate('default', '', '')
    deck.scheduler = scheduler
    setCurrCard(deck.getNext())
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
