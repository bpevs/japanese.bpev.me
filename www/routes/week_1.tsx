import { createEffect, createMemo, createResource, createSignal, Show } from 'solid-js'
import { basic } from '@flashcard/schedulers'
import { fromOBJ } from '@flashcard/adapters'

import Page from '../components/page.tsx'
import Readme from '../components/readme.tsx'

const audioRoot = 'https://static.bpev.me/pages/japanese/audio/'
const rows = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'が', 'ざ', 'だ', 'ば', 'ぱ']

export default function Week1() {
  let deck // deck singleton preserves class props
  const [currCard, setCurrCard] = createSignal(null)
  const [showAnswer, setShowAnswer] = createSignal(false)
  const [row, setRow] = createSignal('あ')
  let audioRef

  const [data] = createResource(async () => {
    const baseURL = `${window.location.origin}/week-1/`
    const resp = await fetch(baseURL + 'ひらがな.json')
    return await resp.json()
  })

  createEffect(() => {
    if (data.loading) return null
    const currData = { ...data() }
    currData.notes = currData.notes.filter(([cat]) => cat === row())
    deck = fromOBJ(currData, { 'sortField': '字' })
    deck.addTemplate(
      'Listening',
      '<h1>{{字}}</h1>',
      '{{ローマ字}}',
    )
    deck.scheduler = basic
    setCurrCard(deck.getNext())
    return deck
  })

  createEffect(() => {
    if (showAnswer() === true) {
      audioRef.play()
    }
  })

  const done = (e) => {
    e.stopPropagation()
    deck.answerCurrent(1)
    setShowAnswer(false)
    setCurrCard(deck.getNext())
  }

  return (
    <Page week='week-1'>
      <article class='pa3 pa5-ns tc'>
        <div>
          <select name='row' onChange={(e) => setRow(e.currentTarget.value)}>
            <For each={rows}>
              {(r, i) => <option selected={r === row()} value={r}>Set {i}: {r}</option>}
            </For>
          </select>
        </div>
        <Show when={currCard()}>
          <div class='pa3 pointer'>
            <audio
              ref={(ref) => audioRef = ref}
              autoplay
              controls
              src={`${audioRoot}${currCard().note.content.字}.mp3`}
            />
          </div>
          <div
            onClick={(e) => {
              if (showAnswer()) done(e)
              else setShowAnswer(true)
            }}
            class='mv3 shadow br3 w-50 pointer'
            style='margin-left: auto; margin-right: auto;'
          >
            <div
              class='absolute f3 pointer'
              style={`
                visibility: ${!showAnswer() ? 'visible' : 'hidden'};
                top: 50%;
                left: 50%;
                transform: translateX(-50%);
              `}
            >
              <h1 class='pointer'>👍</h1>
            </div>
            <div
              class='f-headline pointer'
              style={`visibility: ${showAnswer() ? 'visible' : 'hidden'}`}
              innerHTML={currCard().render().question}
            />
            <div style={`visibility: ${showAnswer() ? 'visible' : 'hidden'}`}>
              <button
                class='ma3 pointer'
                style='border:none; background-color: white; outline: none;'
                onClick={done}
              >
                <h1>✅</h1>
              </button>
              <button
                class='ma3 pointer'
                style='border:none; background-color: white; outline: none;'
                onClick={(e) => {
                  e.stopPropagation()
                  deck.answerCurrent(0)
                  setShowAnswer(false)
                  setCurrCard(deck.getNext())
                }}
              >
                <h1>❌</h1>
              </button>
            </div>
          </div>
        </Show>
        <Show when={!currCard()}>
          <h1 class='f-headline'>Done!🏁</h1>
        </Show>
      </article>
    </Page>
  )
}
