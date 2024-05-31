import { createEffect, createMemo, createSignal, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import SignaturePad from 'npm:signature_pad'

import FlashcardButtons from '../components/flashcard_buttons.tsx'
import Furigana from '../components/furigana.tsx'
import Page from '../components/page.tsx'
import PracticeTypeSelector, { PracticeType } from '../components/practice_type_selector.tsx'
import { audioRoot } from '../constants.ts'
import useFlashcards from '../hooks/use_flashcards.ts'
import infiniSched from '../scheduler.ts'

const { Listening, Speaking, Typing, Writing } = PracticeType
const rows = ['あか', 'さた', 'なは', 'まや', 'らわ', 'がざ', 'だば', 'ぱ']

export default function Week1() {
  let audioRef, selectRef, canvasRef
  const [settings, setSettings] = createStore({
    practiceType: Writing,
    selectedRows: ['Set 1: あか'],
    showKanji: true,
  })

  const isSpeaking = () => settings.practiceType === Speaking
  const [showAnswer, setShowAnswer] = createSignal(false)
  const [practiceInput, setPracticeInput] = createSignal('')
  const [pad, setPad] = createSignal()

  const charData = useFlashcards({
    filter: ([cat]) => settings.selectedRows.join().includes(cat),
    sortField: 'ひらがな',
    url: `${window.location.origin}/week-1/ひらがな.json`,
  })

  const wordData = useFlashcards({
    filter: ([cat]) => settings.selectedRows.join().includes(cat),
    scheduler: infiniSched,
    sortField: 'ひらがな',
    url: `${window.location.origin}/week-1/words.json`,
  })

  const currCard = () => charData.currCard() || wordData.currCard()
  const hasCompletedChars = () => charData.loaded() && !charData.currCard()
  const deck = () => {
    if (!charData.loaded() || !charData.deck()) return null
    if (hasCompletedChars() && wordData.loaded()) return wordData.deck()
    return charData.deck()
  }
  const setCurrCard = (card) => {
    if (!hasCompletedChars()) charData.setCurrCard(card)
    else wordData.setCurrCard(card)
  }

  createEffect(() => showAnswer() ? audioRef.play() : undefined)
  createEffect(() => {
    if (canvasRef && settings.practiceType === Writing) {
      setPad(new SignaturePad(canvasRef))
    }
  })

  function onSuccess(e) {
    e.stopPropagation()
    deck().answerCurrent(1)
    setShowAnswer(false)
    setCurrCard(deck().getNext())
    setPracticeInput('')
    if (pad()) pad().clear()
  }

  onMount(() => {
    function onKeyEvent(e) {
      if (event.keyCode === 13) { // keycode === 'enter'
        if (selectRef.open) selectRef.open = false
        else if (!settings.showAnswer) setShowAnswer(true)
        else onSuccess(e)
      }
      if (
        (event.keyCode === 32) && // keycode === 'spacebar'
        (settings.practiceType !== Speaking) &&
        audioRef
      ) audioRef.play()
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
    <Page week='week-1'>
      <article class='pa3 pa5-ns tc' onClick={() => selectRef.open = false}>
        <div class='tl measure pb4' style='margin: auto;'>
          <h3>Instructions</h3>
          <p>Select 1-2 new sets of ひらがな to learn per day (one at a time!).</p>
          <p>
            It could be helpful to also add the previous day's sets as well. However, the practice words at the end of
            the new characters will also include all prior sets, so it's not strictly necessary!
          </p>
          <Show when={hasCompletedChars()}>
            <h3>Finished!</h3>
            <p>
              Here are some words to practice! Don't worry about remembering the meanings or kanji of the words. We are
              just practicing sounds! Those are just there so that maybe you'll recognize them later.
            </p>
            <p class='b'>(Note: this list will repeat indefinitely)</p>
          </Show>

          <details class='mv4'>
            <summary>Settings</summary>
            <div class='ma4'>
              <label for='show-kanji' class='mr2'>Show Kanji:</label>
              <input
                type='checkbox'
                name='show-kanji'
                onClick={[setSettings, { showKanji: !settings.showKanji }]}
              />
            </div>

            <div class='ma4'>
              <PracticeTypeSelector
                practiceType={() => settings.practiceType}
                setPracticeType={(t) => setSettings('practiceType', t)}
              />
            </div>
            <div class='ma4'>
              <Show when={!hasCompletedChars()}>
                <button
                  onClick={() => {
                    setShowAnswer(false)
                    setCurrCard()
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
            options={rows.map((row, i) => `Set ${i + 1}: ${row}`)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <Show when={currCard()}>
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
            <audio
              ref={(ref) => audioRef = ref}
              autoplay={settings.practiceType !== Speaking}
              controls
              src={`${audioRoot}${currCard().note.content.ひらがな}.mp3`}
            />
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
          <Show when={deck() && currCard()}>
            <div
              class='ba ma1 relative flex flex-column justify-center'
              style={`width: 256px; height: 256px; min-width: 256px; min-height: 256px;`}
            >
              <div style={`visibility: ${(isSpeaking() || showAnswer()) ? 'visible' : 'hidden'}`}>
                <p
                  class={`ma0 ${
                    (
                        hasCompletedChars() &&
                        !settings.showKanji &&
                        currCard().note.content.漢字
                      )
                      ? 'f4'
                      : 'f2'
                  }`}
                >
                  {(settings.showKanji && currCard().note.content.漢字)
                    ? <Furigana>{() => currCard().note.content.漢字}</Furigana>
                    : currCard().note.content.ひらがな}
                </p>
                <Show when={hasCompletedChars() && currCard()}>
                  <p class='ma0'>{currCard().note.content.英語}</p>
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

        <Show when={currCard()}>
          <FlashcardButtons
            isVisible={showAnswer}
            onSuccess={onSuccess}
            onFailure={(e) => {
              e.stopPropagation()
              deck.answerCurrent(0)
              setShowAnswer(false)
              setCurrCard(deck.getNext())
              if (pad()) pad().clear()
            }}
          />
        </Show>
      </article>
    </Page>
  )
}
