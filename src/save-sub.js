import { SAVESUB_ENDPOINTS, SAVESUB_URL } from './constants'

async function fetchSubtitle(youtubeUrl) {
  let authToken = process.env.SAVE_SUB_AUTH_TOKEN
  let userAgent = process.env.SAVE_SUB_USER_AGENT

  let resp = await fetch(`${SAVESUB_URL}${SAVESUB_ENDPOINTS.extract}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-agent': userAgent,
      'x-auth-token': authToken,
      'x-requested-domain': 'savesubs.com',
      'x-requested-with': 'xmlhttprequest'
    },
    body: JSON.stringify({data: {url: youtubeUrl}})
  })

  resp = await resp.json()
  path = resp?.response?.format?.[0]?.url
  params = "stripAngle=true&stripParentheses=true&stripCurly=true&stripSquare=true&stripMusicCues=true&ext=txt"

  resp = await fetch(`${SAVESUB_URL}${path}?${params}`)
  resp = await resp.text()
  console.log(resp)
  return resp
}

export {
  fetchSubtitle
}
