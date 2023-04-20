import { ask, getAccessToken, removeConversation  } from './chat-gpt.js'
import { SUMMARY_QUERY, TRANSLATE_QUERY } from './constants.js';
import { fetchSubtitle } from './youtube-transcript.js';

'use strict';

String.prototype.format = function () {
  // store arguments in an array
  var args = arguments;
  // use replace to iterate over the string
  // select the match and check if the related argument is present
  // if yes, replace the match with the argument
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    // check if the argument is present
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};

async function getJson(text) {
  var total = 500 // any number that is big enough is ok 
  var end = -1 

  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === '}') {
      if (end === -1) {
        end = i
        total = 0
      }
      total += 1
    }

    if (text[i] === '{') {
      total -= 1
    }
    if (total === 0) {
      return text.substring(i, end + 1)
    }
  }

  if (total === 0) {
    return text.substring(0, end + 1)
  } else {
    return ""
  }
}

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
async function getOpenAIToken() {
  return getAccessToken()
}

async function askChatGPT(query, port) {
  var uuid = 'b9cde5a6-1ba5-4b0c-90e9-0a4d5d58c223' // to change 
  var puuid = 'be900e07-b6d2-422b-b666-56a908f85b66' // to change
  var token = await getOpenAIToken() 
  var resp = await ask(uuid, puuid, query, token)

  var reader = resp.body.pipeThrough(new TextDecoderStream()).getReader()
  var conversationId = null 
  var previous = ""

  while (true) {
    var {value, done} = await reader.read();
    if (done) {
      break;
    }
    value = previous + value
    var previous = ""
    if (!value.startsWith('data: ')) {
      continue
    }
    
    var transformed = await getJson(value)
    if (transformed === "") {
      previous = value
      continue
    }

    try {
      var data = JSON.parse(transformed)
      var conversationId = data.conversation_id
      var content = data.message?.content?.parts?.[0]
      if (content === undefined) {
        continue
      }
      port.postMessage({content: data.message?.content?.parts?.[0]})
    } catch (err) {
      console.log(value)
      console.log(transformed)
      port.postMessage({content: "an error has occured"})
      await removeConversation(conversationId, token)
      port.disconnect()
      return 
    }
  }
  await removeConversation(conversationId, token)
  port.disconnect()
}

async function summarize(req, port) {
  var subtitle = await fetchSubtitle(req.url)
  if (subtitle == "") {
    port.postMessage({content: "Cannot obtain video transcript."})
    port.disconnect()
    return;
  }
  var query = SUMMARY_QUERY.format(req.language, subtitle)
  askChatGPT(query, port) 
}

async function translate(req, port) {
  var subtitle = await fetchSubtitle(req.url)
  if (subtitle == "") {
    port.postMessage({content: "Cannot obtain video transcript."})
    port.disconnect()
    return;
  }
  var query = TRANSLATE_QUERY.format(req.language, subtitle)
  askChatGPT(query, port)
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
    } else if (req.type === "TRANSLATE") {
      translate(req, port)
    } else if (req.type === "AUTHENTICATE") {
      authenticate(port) 
    }
  })
});

