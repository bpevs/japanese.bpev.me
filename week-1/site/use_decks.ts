import { createEffect, createMemo, createResource, createSignal } from 'solid-js'
import deckToSprites from '$/utils/deck_to_sprites.ts'
import infiniSched from '$/scheduler.ts'
import { basic } from '@flashcard/schedulers'
import { fromOBJ } from '@flashcard/adapters'
import { Howl } from 'howler'

const rootPath = `${window.location.origin}/week-1/assets`
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
  let charDeck, wordDeck
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
    async () => (await fetch(`/week-1/assets/furigana.json`)).json(),
  )

  createEffect(() => {
    if (!deckResponses()) return { chars: [], words: [] }
    const chars = [], words = []
    deckResponses().forEach((deck) => {
      deck.notes.forEach((row) => (row[0].length > 1 ? words : chars).push(row))
    })
    charDeck = createDeck('chars', chars, basic)
    wordDeck = createDeck('words', words, infiniSched)
    setCurrCard(isComplete() ? wordDeck.getNext() : charDeck.getNext())
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
      currDeck().answerCurrent(grade)
    },
    getNext: () => {
      if (deckResponses.loading) return null
      setCurrCard(currDeck().getNext())
    },
    playAudio: (key) => howl().play(key),
    skipToWords: () => setIsComplete(true),
    isComplete,
    isLoaded: () => !deckResponses.loading,
    kana: () => currCard()?.note?.content?.kana || '',
    english: () => currCard()?.note?.content?.english || '',
    kanji: () => {
      const kanji = currCard()?.note?.content?.kanji || ''
      const text = (furigana()?.[kanji] || kanji).trim()
      const kana = currCard()?.note?.content?.kana
      return (text !== kana) ? text : ''
    },
    romaji: () => currCard()?.note?.content?.romaji || '',
  }
}

function createDeck(name, notes, scheduler) {
  const deck = fromOBJ({
    id: name,
    name,
    desc: name,
    fields: ['kana', 'romaji', 'english', 'kanji'],
    notes,
  }, { sortField: 'kana' })
  deck.scheduler = scheduler
  deck.addTemplate('default', '', '')
  return deck
}
