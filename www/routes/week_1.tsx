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
  const [practiceInput, setPracticeInput] = createSignal('')
  const [practiceType, setPracticeType] = createSignal('write')
  const [pad, setPad] = createSignal()
  const [selectedRows, setSelectedRows] = createSignal(['Set 1: あか'])
  let audioRef
  let selectRef
  let canvas

  const isVertical = () => globalThis.innerHeight > globalThis.innerWidth

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

  const done = (e) => {
    e.stopPropagation()
    deck.answerCurrent(1)
    setShowAnswer(false)
    setCurrCard(deck.getNext())
    setPracticeInput('')
    if (pad()) pad().clear()
  }

  function onSelect(e) {
    const items = (e.target as HTMLInputElement).value
    setSelectedRows(items)
  }

  createEffect(() => {
    if (canvas && practiceType() === 'write') {
      setPad(new SignaturePad(canvas))
    }
  })

  const keyEvent = (e) => {
    // keycode === 'enter'
    if (event.keyCode === 13) {
      if (selectRef.open) selectRef.open = false
      else if (!showAnswer()) setShowAnswer(true)
      else done(e)
    }
    // keycode === 'spacebar'
    if ((event.keyCode === 32) && audioRef) audioRef.play()
  }

  onMount(() => {
    if (selectRef) selectRef.addEventListener('change', onSelect)
    addEventListener('keydown', keyEvent)
    return () => {
      removeEventListener('keydown', keyEvent)
      if (selectRef) selectRef.removeEventListener('change', onSelect)
    }
  })

  createEffect(() => {
    if (data.loading) return null
    const currData = { ...data() }
    currData.notes = currData.notes.filter(([cat]) => selectedRows().join().includes(cat))
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
      currData.notes = currData.notes.filter(([cat]) => selectedRows().join().includes(cat))
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

  return (
    <Page week='week-1'>
      <article class='pa3 pa5-ns tc' onClick={() => selectRef.open = false}>
        <div class='tl measure pb4' style='margin: auto;'>
          <h3>Instructions</h3>
          <p>Select 1-2 new sets of ひらがな to learn per day (one at a time!).</p>
          <p>
            It could be helpful to also add the previous day's sets as well. However, the practice words at the end of
            the new characters will also include all prior sets, so it's not strictly necessary!
          </p>
          <Show when={isInfiniteMode()}>
            <h3>Finished!</h3>
            <p class='b'>
              Here are some words to practice! Don't worry about remembering the meanings or kanji of the words. We are
              just practicing sounds! Those are just there so that maybe you'll recognize them later.
            </p>
            <p>(Note: this list will repeat indefinitely)</p>
          </Show>
          <p class='ma4 tc'>
            <span class='mh2'>Input type to practice:</span>
            <input
              type='radio'
              id='write'
              name='input-type'
              value='input-write'
              class='mh1'
              checked={practiceType() === 'write'}
              onClick={[setPracticeType, 'write']}
            />
            <label class='mr3' for='write'>write</label>

            <input
              type='radio'
              id='type'
              name='input-type'
              value='input-type'
              class='mh1'
              checked={practiceType() === 'type'}
              onClick={[setPracticeType, 'type']}
            />
            <label class='mr3' for='type'>type</label>

            <input
              type='radio'
              id='none'
              name='input-type'
              value='input-none'
              class='mh1'
              checked={practiceType() === 'none'}
              onClick={[setPracticeType, 'none']}
            />
            <label for='none'>none</label>
          </p>
          <ui-multiselect
            style='width: 100%;'
            ref={(ref) => selectRef = ref}
            value={selectedRows()}
            options={rows.map((row, i) => `Set ${i + 1}: ${row}`)}
            onClick={(e) => e.stopPropagation()}
          />
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
        <div
          class='relative'
          style={`
            display: flex;
            align-items: start;
            justify-content: center;
            margin: auto;
            flex-wrap: wrap;
          `}
        >
          <Show when={practiceType() === 'write'}>
            <canvas
              ref={canvas}
              width='256'
              height='256'
              class='ba ma1'
              style='width: 254px; height: 254px;'
            />
          </Show>
          <Show when={practiceType() === 'type'}>
            <div
              class='ma1 relative'
              style='width: 256px; height: 256px;'
            >
              <input
                autofocus
                value={practiceInput()}
                onInput={(e) => setPracticeInput(e.target.value)}
                disabled={showAnswer()}
                class='w-90 f2 ba'
                style='position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);'
              />
            </div>
          </Show>
          <Show when={currCard()}>
            <div
              class='ba ma1 relative flex flex-column justify-center'
              style={`width: 256px; height: 256px; min-width: 256px; min-height: 256px;`}
            >
              <Show when={showAnswer()}>
                <p
                  class={`ma0 ${isInfiniteMode() ? 'f4' : 'f2'}`}
                  innerHTML={currCard().render().answer}
                />
                <Show when={isInfiniteMode()}>
                  <p class='ma0'>
                    {currCard().note.content.英語}
                    <Show when={currCard().note.content.漢字}>
                      {` - ${currCard().note.content.漢字}`}
                    </Show>
                  </p>
                </Show>
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
