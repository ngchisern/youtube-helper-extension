import { CHAT_ENDPOINTS, CHAT_MODEL, CHAT_URL } from "./constants"

async function getAccessToken() {
  const resp = await fetch(`${CHAT_URL}${CHAT_ENDPOINTS.auth}`)
  if (resp.status == 403) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  return data.accessToken
}

async function removeConversation(id, token) {
  return await fetch(`${CHAT_URL}${CHAT_ENDPOINTS.conversation}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({is_visible: false})
  })
}

async function ask(uuid, puuid, question, token) {
  return await fetch(`${CHAT_URL}${CHAT_ENDPOINTS.conversation}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'next',
      messages: [{
        id: uuid, 
        role: 'user',
        content: {
          content_type: 'text',
          parts: [question]
        }
      }],
      model: CHAT_MODEL,
      parent_message_id: puuid
    })
  })
}

export {
  getAccessToken,
  removeConversation,
  ask
}
