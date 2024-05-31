import { createEffect, createResource, createSignal } from 'solid-js'
import { basic } from '@flashcard/schedulers'
import { fromOBJ } from '@flashcard/adapters'

export default function useFlashcards({ filter, url, scheduler = basic, sortField }) {
  let deck
  const [loaded, setLoaded] = createSignal(false)
  const [currCard, setCurrCard] = createSignal(null)

  const [data] = createResource(url, async () => {
    const resp = await fetch(url)
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

  return { deck: () => deck, loaded, currCard, setCurrCard }
}
