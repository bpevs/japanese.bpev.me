import { createEffect, createMemo, createResource, createSignal, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import SignaturePad from 'npm:signature_pad'

import FlashcardButtons from '$/components/flashcard_buttons.tsx'
import Readme from '$/components/readme.tsx'
import PracticeTypeSelector, { PracticeType } from '$/components/select_practice_type.tsx'
import DisplayTypeSelector, { DisplayType } from '$/components/select_display_type.tsx'
import infiniSched from '$/scheduler.ts'
import useDecks from './use_decks.ts'

const rows = ['あか', 'さた', 'なは', 'まや', 'らわ', 'がざ', 'だば', 'ぱ']
const { Listening, Speaking, Typing, Writing } = PracticeType
const { Furigana, Hiragana, Kanji, Strokes } = DisplayType
const README = '#readme'
const EXERCISE = '#exercise'

export default function Week1() {
  let audioRef, selectRef, canvasRef
  const [tab, setTab] = createSignal(
    [README, EXERCISE].includes(location.hash.toLowerCase()) ? location.hash.toLowerCase() : README,
  )

  const [settings, setSettings] = createStore({
    practiceType: Writing,
    displayType: Furigana,
    selectedRows: [rows[0]],
  })

  const {
    answerCurrent,
    getNext,
    playAudio,
    skipToWords,
    isComplete,
    isLoaded,
    kana,
    english,
    kanji,
    romaji,
  } = useDecks({ rows: () => settings.selectedRows })

  const showKanji = () => [Furigana, Kanji].includes(settings.displayType)
  const isSpeaking = () => settings.practiceType === Speaking
  const isWriting = () => settings.practiceType === Writing

  const [showAnswer, setShowAnswer] = createSignal(false)
  const [practiceInput, setPracticeInput] = createSignal('')
  const [pad, setPad] = createSignal()

  createEffect(() => {
    if ((tab() === EXERCISE) && canvasRef && isWriting()) setPad(new SignaturePad(canvasRef))
  })

  // Play audio on load and on answer
  createEffect(() => {
    if (tab() === EXERCISE) playAudio(kana())
  })
  createEffect(() => showAnswer() ? playAudio(kana()) : undefined)

  function answer(e, grade) {
    e.stopPropagation()
    answerCurrent(grade)
    setShowAnswer(false)
    getNext()
    setPracticeInput('')
    if (pad()) pad().clear()
  }

  onMount(() => {
    function onKeyEvent(e) {
      if (event.keyCode === 13) { // keycode === 'enter'
        if (selectRef.open) selectRef.open = false
        else if (!settings.showAnswer) setShowAnswer(true)
        else answer(e, 1)
      }
      if (
        (event.keyCode === 32) && // keycode === 'spacebar'
        (settings.practiceType !== Speaking)
      ) playAudio(kana())
    }

    function onSelectRows(e) {
      const selectedRows = (e.target as HTMLInputElement).value
      if (selectedRows.length) {
        setSettings({ ...settings, selectedRows })
        setPracticeInput('')
        if (pad()) pad().clear()
      }
    }

    if (selectRef) selectRef.addEventListener('change', onSelectRows)
    addEventListener('keydown', onKeyEvent)
    return () => {
      removeEventListener('keydown', onKeyEvent)
      if (selectRef) selectRef.removeEventListener('change', onSelectRows)
    }
  })

  return (
    <div>
      <nav class='ph3 ph4-m ph5-l pb3 pb4-ns bg-black'>
        <div
          class={`link dim white b f6 f5-ns dib mr3` +
            ((tab() === README) ? ' underline' : '')}
          onClick={() => {
            setTab(README)
            location.hash = README
          }}
        >
          readme
        </div>
        <div
          class={`link dim white b f6 f5-ns dib mr3` +
            ((tab() === EXERCISE) ? ' underline' : '')}
          onClick={() => {
            setTab(EXERCISE)
            location.hash = EXERCISE
          }}
        >
          exercise 1
        </div>
      </nav>
      <Show when={tab() === README}>
        <Readme week='week-1' />
      </Show>
      <Show when={tab() === EXERCISE}>
        <article class='pa3 pa5-ns tc' onClick={() => selectRef.open = false}>
          <div class='tl measure pb4' style='margin: auto;'>
            <h3>Instructions</h3>
            <p>
              Select 1-2 new sets of ひらがな to learn per day (one at a time!).
            </p>
            <p>
              It could be helpful to also add the previous day's sets as well. However, the practice words at the end of
              the new characters will also include all prior sets, so it's not strictly necessary!
            </p>

            <Show when={isComplete()}>
              <h3>Finished!</h3>
              <p>
                Here are some words to practice! Don't worry about remembering the meanings or kanji of the words. We
                are just practicing sounds! Those are just there so that maybe you'll recognize them later.
              </p>
              <p class='b'>(Note: this list will repeat indefinitely)</p>
            </Show>

            <details class='mv4'>
              <summary>Settings</summary>
              <div class='ma4'>
                <DisplayTypeSelector
                  displayType={() => settings.displayType}
                  setDisplayType={(t) => setSettings('displayType', t)}
                />
              </div>

              <div class='ma4'>
                <PracticeTypeSelector
                  practiceType={() => settings.practiceType}
                  setPracticeType={(t) => setSettings('practiceType', t)}
                />
              </div>
              <div class='ma4'>
                <Show when={!isComplete()}>
                  <button
                    onClick={() => {
                      setShowAnswer(false)
                      skipToWords()
                      setPracticeInput('')
                      if (pad()) pad().clear()
                    }}
                  >
                    skip to words
                  </button>
                </Show>
              </div>
            </details>

            <ui-multiselect
              style='width: 100%;'
              ref={(ref) => selectRef = ref}
              value={settings.selectedRows}
              options={rows.map((row, i) => row)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <Show when={kana()}>
            <div
              class='pa3'
              style={`visibility: ${
                (
                    (settings.practiceType === Speaking) &&
                    !showAnswer()
                  )
                  ? 'hidden'
                  : 'visible'
              }`}
            >
              <button
                onClick={() => {
                  playAudio(kana())
                }}
              >
                play audio
              </button>
            </div>
          </Show>
          <div class='relative flex items-start justify-center flex-wrap center'>
            <Show when={settings.practiceType === Writing}>
              <canvas
                ref={canvasRef}
                width='256'
                height='256'
                class='ba ma1'
                style='width: 254px; height: 254px;'
              />
            </Show>
            <Show when={settings.practiceType === Typing}>
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
            <Show when={kana()}>
              <div
                class='ba ma1 relative flex flex-column justify-center'
                style={`width: 256px; height: 256px; min-width: 256px; min-height: 256px;`}
              >
                <div style={`visibility: ${(isSpeaking() || showAnswer()) ? 'visible' : 'hidden'}`}>
                  <Show when={showKanji() && isComplete() && kanji()}>
                    <p class='ma0 f2' innerHTML={kanji()} />
                  </Show>
                  <Show
                    when={(Hiragana === settings.displayType) ||
                      ((Furigana === settings.displayType) && !kanji()) ||
                      ((Strokes === settings.displayType) && isComplete())}
                  >
                    <p class={`ma0 ${(kana().length) > 2 ? 'f4' : 'f2'}`}>
                      {kana()}
                    </p>
                  </Show>
                  <Show
                    when={(settings.displayType === Strokes) &&
                      !isComplete() &&
                      showAnswer()}
                  >
                    <img
                      style='height: 90%; width: auto;'
                      src={`/www/static/strokes/hiragana/${kana()}.svg`}
                    />
                  </Show>
                  <Show when={isComplete() && kana()}>
                    <p class='ma0'>{english()}</p>
                  </Show>
                </div>
                <button
                  class='absolute f5'
                  style='bottom: 10px; left: 50%; transform: translateX(-50%);'
                  onClick={[setShowAnswer, true]}
                >
                  {isSpeaking() ? 'play audio' : 'show answer'}
                </button>
              </div>
            </Show>
          </div>

          <Show when={kana()}>
            <FlashcardButtons
              isVisible={showAnswer}
              onSuccess={(e) => answer(e, 1)}
              onFailure={(e) => answer(e, 0)}
            />
          </Show>
        </article>
      </Show>
    </div>
  )
}
