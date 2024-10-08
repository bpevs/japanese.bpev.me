import { createEffect, createSignal, For } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createApiClient } from '@bpev/japanese/wanikani'

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

const api = createApiClient('https://api.wanikani.com/v2')
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
    setEntry(await getEntry(currDate()))
  })

  return (
    <article class='lh-copy measure pa2' style='margin: auto;'>
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

// Format date to yyyy-mm-dd
function getDateString(date: Date = new Date()) {
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 101).toString().substring(1)
  const day = (date.getDate() + 100).toString().substring(1)
  return year + '-' + month + '-' + day
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

  const headers = { 'Authorization': 'Bearer ' + token }

  try {
    const userData = await api.getUser({ headers })

    const userLevel = Math.max(userData.data.level - 1, 0)
    const levels = []
    for (let i = userLevel; i > 0; i--) levels.push(i)

    const params = { levels, types: 'vocabulary' }
    const data = await api.getSubjects({ headers, params })

    return sample(data.data, 5)
      .map((item) => {
        const url = item.data.document_url
        const characters = item.data.characters
        return { url, characters }
      })
  } catch (error) {
    console.error(error)
  }

  function sample(arr, num: number) {
    const arrCopy = arr.slice()
    let currentIndex = arrCopy.length

    while (currentIndex != 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      ;[arrCopy[currentIndex], arrCopy[randomIndex]] = [
        arrCopy[randomIndex],
        arrCopy[currentIndex],
      ]
    }
    return arrCopy.slice(0, num)
  }
}
