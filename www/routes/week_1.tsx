import { createEffect, createMemo, createResource, createSignal, onMount, Show } from 'solid-js'
import { basic } from '@flashcard/schedulers'
import { fromOBJ } from '@flashcard/adapters'
import infiniSched from '../scheduler.ts'
import SignaturePad from 'npm:signature_pad'

import Page from '../components/page.tsx'
import Readme from '../components/readme.tsx'

const audioRoot = 'https://static.bpev.me/pages/japanese/audio/'
const rows = ['あか', 'さた', 'なは', 'まや', 'らわ', 'がざ', 'だば', 'ぱ']

export default function Week1() {
  let deck // deck singleton preserves class props
  const [currCard, setCurrCard] = createSignal(null)
  const [showAnswer, setShowAnswer] = createSignal(false)
  const [isInfiniteMode, setInfiniteMode] = createSignal(false)
  const [pad, setPad] = createSignal()
  const [row, setRow] = createSignal('あか')
  let audioRef
  let canvas

  const [data] = createResource(async () => {
    const baseURL = `${window.location.origin}/week-1/`
    const resp = await fetch(baseURL + 'ひらがな.json')
    return await resp.json()
  })
  const [wordData] = createResource(async () => {
    const baseURL = `${window.location.origin}/week-1/`
    const resp = await fetch(baseURL + 'words.json')
    return await resp.json()
  })

  onMount(() => {
    console.log(canvas)
    if (canvas) {
      setPad(new SignaturePad(canvas))
    }
  })

  createEffect(() => {
    if (data.loading) return null
    const currData = { ...data() }
    currData.notes = currData.notes.filter(([cat]) => row().includes(cat))
    deck = fromOBJ(currData, { 'sortField': 'ひらがな' })
    deck.addTemplate(
      'Listening',
      '',
      '<h1>{{ひらがな}}</h1>',
    )
    deck.scheduler = basic
    setCurrCard(deck.getNext())
    return deck
  })

  createEffect(() => {
    if (!data.loading && !currCard()) {
      const currData = { ...wordData() }
      currData.notes = currData.notes.filter(([cat]) => row().includes(cat))
      deck = fromOBJ(currData, { 'sortField': 'ひらがな' })
      deck.addTemplate(
        'Listening',
        '',
        '<h1>{{ひらがな}}</h1>',
      )
      deck.scheduler = infiniSched
      setCurrCard(deck.getNext())
      setInfiniteMode(true)
    }
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
    if (pad()) pad().clear()
  }

  return (
    <Page week='week-1'>
      <article class='pa3 pa5-ns tc'>
        <div>
          <select
            name='row'
            multiple
            onChange={(e) => {
              const options = e.target.options
              let selectedValues = ''
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selectedValues += options[i].value
                }
              }
              setRow(selectedValues)
            }}
          >
            <For each={rows}>
              {(r, i) => (
                <option
                  selected={row().includes(r)}
                  value={r}
                >
                  Set {i() + 1}: {r}
                </option>
              )}
            </For>
          </select>
        </div>

        <Show when={currCard()}>
          <div class='pa3'>
            <audio
              ref={(ref) => audioRef = ref}
              autoplay
              controls
              src={`${audioRoot}${currCard().note.content.ひらがな}.mp3`}
            />
          </div>
        </Show>

        <p style={`visibility: ${isInfiniteMode() ? 'visible' : 'hidden'}`}>
          Finished! Now practice some words using these characters until you feel comfortable!
        </p>

        <div class='relative' style='width: 512px; height: 256px; margin: auto;'>
          <canvas
            ref={canvas}
            width='256'
            height='256'
            class='ba'
            style='top: 0; left: 0; position: absolute; width: 256px; height: 254px;'
          />
          <Show when={currCard()}>
            <div
              class='absolute ba'
              style={`
                top: 0;
                left: 257px;
                width: 256px;
                height: 256px;
              `}
            >
              <Show when={showAnswer()}>
                <div
                  class={`${(currCard().content.ひらがな > 2) ? 'f3' : 'f2'}`}
                  style='position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);'
                  innerHTML={currCard().render().answer}
                />
              </Show>
              <button
                class='f5'
                style='position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);'
                onClick={[setShowAnswer, true]}
              >
                show
              </button>
            </div>
          </Show>
        </div>

        <Show when={currCard()}>
          <div
            class='mv3 shadow br3 w-50'
            style='margin-left: auto; margin-right: auto;'
          >
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
                  if (pad()) pad().clear()
                }}
              >
                <h1>❌</h1>
              </button>
            </div>
          </div>
        </Show>
      </article>
    </Page>
  )
}
