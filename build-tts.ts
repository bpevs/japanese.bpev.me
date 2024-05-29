import { load } from 'jsr:@std/dotenv'
import { fromJSON } from 'jsr:@flashcard/adapters'
import { generateTTS } from 'jsr:@flashcard/utils'

const env = await load()

const locale = 'ja-JP'
const voiceId = 'ja-JP-NanamiNeural'
const apiRegion = env['AZURE_REGION']
const ttsApiKey = env['AZURE_SPEECH_KEY']

const resp = Deno.readTextFileSync('./week-1/ひらがな.json')
const deck = fromJSON(resp, { sortField: '字' })
deck.addTemplate('listening', '<h1>{{audio}}</h1>', '<h1>{{字}}</h1>')

await generateTTS(deck, {
  apiKey: ttsApiKey,
  apiRegion,
  fromField: '字',
  locale,
  voiceId,
})
