import { createEffect, createResource, createSignal, For, Show } from 'solid-js'

const waniSubjectsUrl = 'https://api.wanikani.com/v2/subjects?types=vocabulary'

async function fetchWani(token) {
  if (!token) return []

  const url = waniSubjectsUrl
  const headers = { 'Authorization': token }
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
}

const initialWaniToken = localStorage.getItem('wani-kani-token') || ''

export default function Journal() {
  let waniTokenInputRef
  const [entry, setEntry] = createSignal('')
  const [wanikaniToken, setWanikaniToken] = createSignal(initialWaniToken)
  const [waniVocabulary] = createResource(wanikaniToken, fetchWani)

  return (
    <article class='lh-copy measure pt4' style='margin: auto;'>
      <form class='pa4 black-80'>
        <div class='measure'>
          <label for='name' class='f6 b db mb2'>WaniKani Token</label>
          <input
            class='input-reset ba pa2 mb2 db w-100'
            type='text'
            ref={waniTokenInputRef}
            value={initialWaniToken}
          />
          <small id='name-desc' class='f6 black-60 db mb2'>
            Pulls "known" vocabulary from WaniKani
          </small>
        </div>

        <button
          onClick={() => {
            const value = waniTokenInputRef.value
            setWanikaniToken(value)
            localStorage.setItem('wani-kani-token', value || '')
          }}
        >
          update token
        </button>
      </form>

      <div class='measure pa4'>
        <Show
          when={waniVocabulary.loading}
          fallback='The words of the day!'
        >
          loading...
        </Show>

        <div>
          <For each={waniVocabulary()}>
            {({ url, characters }) => {
              return (
                <a
                  target='_blank'
                  style={`color: black; background-color: ${entry().includes(characters) ? '#ADD8E6' : 'white'}`}
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

      <div class='pa4'>
        <textarea
          class='f5 db border-box hover-black w-100 measure ba pa2 br2 mb2'
          rows='10'
          value={entry()}
          onInput={(e) => setEntry(e.target.value)}
        />
      </div>
    </article>
  )
}

function sample(arr, num) {
  const shuffled = arr.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, num)
}
