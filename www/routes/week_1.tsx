import { createEffect, createMemo, createResource, createSignal, Show } from 'solid-js'
import { basic } from '@flashcard/schedulers'
import { fromOBJ } from '@flashcard/adapters'

import Page from '../components/page.tsx'
import Readme from '../components/readme.tsx'

export default function Week1() {
  let deck // deck singleton preserves class props
  const [currCard, setCurrCard] = createSignal(null)

  const [data] = createResource(async () => {
    const baseURL = `${window.location.origin}/week-1/`
    const resp = await fetch(baseURL + 'ひらがな.json')
    return await resp.json()
  })

  createEffect(() => {
    if (data.loading) return null
    const currData = { ...data() }
    currData.notes = currData.notes.filter(([cat]) => cat === 'あ')
    deck = fromOBJ(currData, { 'sortField': '字' })
    deck.addTemplate('Listening', '<h1>{{字}}</h1>', '{{ローマ字}}')
    deck.scheduler = basic
    setCurrCard(deck.getNext())
    return deck
  })

  return (
    <Page week='week-1'>
      <article class='pa3 pa5-ns'>
        <Show when={currCard()}>
          <div innerHTML={currCard().render().question} />
          <div innerHTML={currCard().render().answer} />
          <button
            onClick={() => {
              deck.answerCurrent(1)
              const next = deck.getNext()
              setCurrCard(next)
            }}
          >
            ✅
          </button>
          <button
            onClick={() => {
              deck.answerCurrent(0)
              setCurrCard(deck.getNext())
            }}
          >
            ❌
          </button>
        </Show>
        <Show when={deck && !currCard()}>
          Done!
        </Show>
      </article>
    </Page>
  )
}
