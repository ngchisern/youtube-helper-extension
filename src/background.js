import { ask, getAccessToken, removeConversation  } from './chat-gpt.js'
import { QUERY } from './constants.js';
import { fetchSubtitle } from './save-sub.js';

'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
async function getOpenAIToken() {
  return getAccessToken()
}

async function summarize(req, port) {
  let uuid = 'b9cde5a6-1ba5-4b0c-90e9-0a4d5d58c223'
  let puuid = 'be900e07-b6d2-422b-b666-56a908f85b66'
  let subtitle = fetchSubtitle(req.url)
  let query = QUERY.format(subtitle)
  let token = getOpenAIToken() 
  resp = ask(uuid, puuid, query, token)

  reader = resp.body.pipeThrough(new TextDecoderStream()).getReader()
  let conversationId = null 

  while (True) {
    const {value, done} = await reader.read();
    if (done) {
      break;
    }
    console.log(value)
    if (!value.startsWith('data: ')) {
      continue
    }
    open = value.indexOf('{')
    close = value.indexOf('}')
    try {
      data = JSON.parse(value.substring(open, close + 1))
    } catch (err) {
      port.postMessage({ type: "SUMMARY", content: "an error has occured"})
      await removeConversation(conversationId, token)
      port.disconnect()
    }
    conversationId = data.conversation_id
    port.postMessage({type: "SUMMARY", content: data.message?.content?.parts?.[0]})
  }
  await removeConversation(conversationId, token)
  port.disconnect()
}

async function authenticate(port) {
  try {
    await getOpenAIToken()
    port.postMessage({ isAuthenticated: true })
  } catch (err) {
    port.postMessage({ isAuthenticated: false })
  } finally {
    port.disconnect()
  }
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(async function(req) {
    if (req.type === "SUMMARY") {
      summarize(req, port) 
    } else if (req.type === "AUTHENTICATE") {
      authenticate(port) 
    }
  })
});

