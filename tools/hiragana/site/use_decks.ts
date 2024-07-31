import { createEffect, createMemo, createResource, createSignal } from 'solid-js'
import deckToSprites from '$/utils/deck_to_sprites.ts'
import infiniSched from '$/scheduler.ts'
import basic from '@bpev/flashcards/schedulers/basic'
import { Deck } from '@bpev/flashcards'
import { Howl } from 'howler'

const rootPath = `${window.location.origin}/tools/hiragana/assets`
const filenameMap = {
  'あか': '01_aka',
  'さた': '02_sata',
  'なは': '03_naha',
  'まや': '04_maya',
  'らわ': '05_rawa',
  'がざ': '06_gaza',
  'だば': '07_daba',
  'ぱ': '08_pa',
}

const cache = {}

export default function useDecks({ rows }) {
  const charDeck = new Deck(basic)
  const wordDeck = new Deck(infiniSched)
  const [isComplete, setIsComplete] = createSignal(false)
  const [currCard, setCurrCard] = createSignal()
  const currDeck = () => isComplete() ? wordDeck : charDeck

  const deckURLs = () => rows().map((row) => `${rootPath}/flashcards/${filenameMap[row]}.json`)
  const [deckResponses] = createResource(deckURLs, () =>
    Promise.all(
      deckURLs().map(async (url) => {
        if (!cache[url]) cache[url] = await (await fetch(url)).json()
        return cache[url]
      }),
    ))
  const [furigana] = createResource(
    async () => (await fetch(`/tools/hiragana/assets/furigana.json`)).json(),
  )

  createEffect(() => {
    if (!deckResponses()) return { chars: [], words: [] }
    deckResponses().forEach((deck) => {
      deck.notes.forEach(([kana, romaji, english, kanji]) => {
        const row = { kana, romaji, english, kanji }
        if (kana.length > 1) wordDeck.addCard(kana, row)
        else charDeck.addCard(kana, row)
      })
    })

    setCurrCard(isComplete() ? wordDeck.getNext(1)[0] : charDeck.getNext(1)[0])
  })

  const howl = createMemo(() => {
    if (deckResponses.loading) return { play: () => {} }

    const howlerMap = {}
    rows().forEach((row, index) => {
      const src = `${rootPath}/audio/${filenameMap[row]}.mp3`
      const deck = deckResponses()[index]
      const sprite = deckToSprites('kana', deck)
      const howler = new Howl({ src, sprite })
      deck.notes.forEach((note) => howlerMap[note[0]] = howler)
    })

    return { play: (kana) => howlerMap[kana].play(kana) }
  })

  return {
    answerCurrent: (grade) => {
      if (deckResponses.loading) return null
      currCard().answer(currDeck().scheduler, grade)
    },
    getNext: () => {
      if (deckResponses.loading) return null
      setCurrCard(currDeck().getNext(1)[0])
    },
    playAudio: (key) => howl().play(key),
    skipToWords: () => setIsComplete(true),
    isComplete,
    isLoaded: () => !deckResponses.loading,
    kana: () => currCard()?.content?.kana || '',
    english: () => currCard()?.content?.english || '',
    kanji: () => {
      const kanji = currCard()?.content?.kanji || ''
      const text = (furigana()?.[kanji] || kanji).trim()
      const kana = currCard()?.content?.kana
      return (text !== kana) ? text : ''
    },
    romaji: () => currCard()?.content?.romaji || '',
  }
}
