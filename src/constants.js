// CHATGPT CONSTANT
const CHAT_URL = "https://chat.openai.com"
const CHAT_ENDPOINTS = {
  auth: "/api/auth/session",
  conversation: "/backend-api/conversation",

}
const CHAT_MODEL = "text-davinci-002-render"

// SAVESUBS CONSTANT
const SAVESUB_URL = "https://savesubs.com"
const SAVESUB_ENDPOINTS = {
  extract: "/action/extract"
}

// QUERY 
const QUERY = `
{0}
Summarize the content from the above text in English with less than ten bullet points.
Summary:
`

export {
  CHAT_URL,
  CHAT_ENDPOINTS,
  CHAT_MODEL,
  SAVESUB_URL,
  SAVESUB_ENDPOINTS,
  QUERY
}
