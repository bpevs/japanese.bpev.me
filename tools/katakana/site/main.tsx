import { createEffect, createSignal, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'

import FlashcardButtons from '$/components/flashcard_buttons.tsx'
import PracticeTypeSelector, { PracticeType } from '$/components/select_practice_type.tsx'
import DisplayTypeSelector, { DisplayType } from '$/components/select_display_type.tsx'
import infiniSched from '$/scheduler.ts'
import useDeck from '$/hooks/use_deck.ts'

const { Speaking, Typing } = PracticeType
const { Furigana, Hiragana, Kanji } = DisplayType
const rootPath = `${window.location.origin}/tools/katakana/assets`

export default function Katakana() {
  let selectRef

  const [selected, setSelected] = createSignal('pokemon')
  const deckURL = () => `${rootPath}/flashcards/${selected()}.json`
  const [settings, setSettings] = createStore({
    practiceType: Typing,
    displayType: Furigana,
  })

  const {
    deck,
    currCard,
    setCurrCard,
    playAudio,
  } = useDeck({
    audioURL: `${rootPath}/audio/${selected()}.mp3`,
    deckURL: deckURL(),
    scheduler: infiniSched,
  })

  const kanji = () => currCard()?.content?.kanji
  const kana = () => currCard()?.content?.kana
  const image = () => currCard()?.content?.image

  const showKanji = () => [Furigana, Kanji].includes(settings.displayType)
  const isSpeaking = () => settings.practiceType === Speaking

  const [showAnswer, setShowAnswer] = createSignal(false)
  const [practiceInput, setPracticeInput] = createSignal('')

  createEffect(() => {
    if (!isSpeaking()) playAudio(kana())
  })
  createEffect(() => showAnswer() ? playAudio(kana()) : undefined)

  function answer(e, grade) {
    e.stopPropagation()
    currCard().answer(deck().scheduler, grade)
    setShowAnswer(false)
    setCurrCard(deck().getNext(1)[0])
    setPracticeInput('')
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
    <article class='pa3 pa5-ns tc'>
      <div class='tl measure pb4' style='margin: auto;'>
        <select value={selected()} onInput={(e) => setSelected(e.currentTarget.value)}>
          <option selected='selected' value='pokemon'>Pokémon</option>
        </select>
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
        </details>
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
              <Show when={showKanji() && kanji()}>
                <p class='ma0 f2' innerHTML={kanji()} />
              </Show>
              <Show
                when={(Hiragana === settings.displayType) ||
                  ((Furigana === settings.displayType) && !kanji())}
              >
                <p class={`ma0 ${(kana().length) > 2 ? 'f4' : 'f2'}`}>
                  {kana()}
                </p>
              </Show>
              <Show when={kana()}>
                <img class='ma0' src={`https://static.bpev.me/pages/japanese/images/pokemon/${image()}`} />
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
  )
}
