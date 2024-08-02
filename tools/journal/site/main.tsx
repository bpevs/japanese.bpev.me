import { createEffect, createSignal, For } from 'solid-js'
import { createStore } from 'solid-js/store'

/** Words to be used in an entry; url links back to definition / source **/
interface Word {
  characters: string
  url: string
}

/**
 * An entry is a combination of user-inputed response + reccomended daily words.
 * The recommended words change daily
 */
interface Entry {
  words: Word[]
  text: string
  date: string
}

const [wanikaniToken, setWanikaniToken] = createSignal(
  localStorage.getItem('wani-kani-token') || '',
)

const entries = getEntries()
const dates = [
  ...new Set(
    entries.map((entry) => entry.date)
      .concat([getDateString()]),
  ),
]

export default function Journal() {
  let waniTokenInputRef
  const [currDate, setCurrDate] = createSignal(new Date())
  const [entry, setEntry] = createStore<Entry>({
    text: '',
    words: [],
    date: getDateString(currDate()),
  })

  createEffect(async () => {
    const entry = await getEntry(currDate())
    setEntry(entry)
  })

  return (
    <article class='lh-copy measure pt4' style='margin: auto;'>
      <details>
        <summary>Settings</summary>
        <form
          class='pa4 black-80'
          onSubmit={() => {
            const value = waniTokenInputRef.value
            setWanikaniToken(value)
            localStorage.setItem('wani-kani-token', value || '')
          }}
        >
          <div class='measure'>
            <label for='name' class='f6 b db mb2'>WaniKani Token</label>
            <input
              class='input-reset ba pa2 mb2 db w-100'
              type='text'
              ref={waniTokenInputRef}
              value={wanikaniToken()}
            />
            <small id='name-desc' class='f6 black-60 db mb2'>
              Pulls "known" vocabulary from WaniKani
            </small>
          </div>
          <button>update settings</button>
        </form>
      </details>

      <select
        onChange={(e) => {
          setCurrDate(new Date(e.currentTarget.value))
        }}
      >
        <For each={dates}>
          {(dateString: string) => (
            <option
              value={dateString}
              selected={dateString === entry.date}
            >
              {dateString}
            </option>
          )}
        </For>
      </select>

      <h2>{entry.dateString}</h2>
      <h3>今日の字:</h3>

      <div class='measure'>
        <div>
          <For each={entry.words}>
            {({ url, characters }: Word) => {
              return (
                <a
                  target='_blank'
                  style={`color: black; background-color: ${entry.text.includes(characters) ? '#ADD8E6' : 'white'}`}
                  class='dib pa2 ba br2 ma2 f4 no-underline'
                  href={url}
                >
                  {characters}
                </a>
              )
            }}
          </For>
        </div>
      </div>

      <div class='pv4'>
        <textarea
          class='f5 db border-box hover-black w-100 measure ba pa2 br2 mb2'
          rows='10'
          value={entry.text}
          onInput={(e) => setEntry('text', e.target.value)}
        />
        <button onClick={() => saveEntry(entry)}>Save</button>
      </div>
    </article>
  )
}

function getDateString(date: Date = new Date()) {
  return date.toLocaleDateString().split(',')[0]
}

function getEntries(): { [dateString: string]: Entry } {
  try {
    const entries = JSON.parse(localStorage.getItem('journal-entries') || '[]')
    if (Array.isArray(entries)) return entries
    return []
  } catch {
    return []
  }
}

function saveEntry(newEntry: Entry) {
  const isNew = !getEntries()
    .find((entry: Entry) => entry.date === newEntry.date)
  let entries = getEntries()

  if (isNew) entries.push(newEntry)
  else {
    entries = entries
      .map((entry) => (entry.date === newEntry.date) ? newEntry : entry)
  }

  localStorage.setItem('journal-entries', JSON.stringify(entries))
}

async function getEntry(date?: Date): Entry | null {
  const dateString = getDateString(date)
  const entry = getEntries().find((entry: Entry) => entry.date === dateString)

  if (entry) return entry
  if (!wanikaniToken()) return null
  const words: Word[] = await fetchWanikanaVocab(wanikaniToken())
  return { words, text: '', date: dateString }
}

async function fetchWanikanaVocab(token: string) {
  if (!token) return []

  const url = 'https://api.wanikani.com/v2/subjects?types=vocabulary'
  const headers = { 'Authorization': 'Bearer ' + token }
  const options = { headers, method: 'GET' }

  try {
    const userResp = await fetch('https://api.wanikani.com/v2/user', options)
    const userData = await userResp.json()
    const userLevel = Math.max(userData.data.level - 1, 0)
    const vocabLevels = []
    for (let i = userLevel; i > 0; i--) vocabLevels.push(i)
    const levelsParam = `&levels=${vocabLevels.join(',')}`

    const subjectsResp = await fetch(url + levelsParam, options)
    const data = await subjectsResp.json()
    const vocabulary = sample(data.data, 5)
      .map((item) => {
        const url = item.data.document_url
        const characters = item.data.characters
        return { url, characters }
      })
    return vocabulary
  } catch (error) {
    console.error(error)
  }

  function sample(arr, num) {
    const shuffled = shuffle(arr)
    return shuffled.slice(0, num)
  }

  function shuffle(array) {
    let currentIndex = array.length

    while (currentIndex != 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
    }
    return array
  }
}
