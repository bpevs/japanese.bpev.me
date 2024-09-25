import { createApiClient } from '@bpev/japanese/marumori'

const headers = { 'Authorization': 'Bearer ' + 'my-token-here' }

const api = createApiClient('https://public-api.marumori.io')

export async function fetchMmVocab() {
  const resp = await api.get('/known/vocabulary', { headers })
  console.log(resp)
}
