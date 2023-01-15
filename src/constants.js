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
const SUMMARY_QUERY = `
Summarize the content from the below text in {0} with less than ten bullet points.
{1}
Summary:
`
const TRANSLATE_QUERY = `
Translate the following text into {0}:
"{1}"
`

export {
  CHAT_URL,
  CHAT_ENDPOINTS,
  CHAT_MODEL,
  SAVESUB_URL,
  SAVESUB_ENDPOINTS,
  SUMMARY_QUERY,
  TRANSLATE_QUERY
}
