// CHATGPT CONSTANT
const CHAT_URL = "https://chat.openai.com"
const CHAT_ENDPOINTS = {
  auth: "/api/auth/session",
  conversation: "/backend-api/conversation",

}
const CHAT_MODEL = "text-davinci-002-render"

// QUERY 
const SUMMARY_QUERY = `
I want you to act as an expert in summarizing Youtube videos from any languages to {0}. 
Now, summarize the content from the below text in less than 10 bullet points.
{1}
`
const TRANSLATE_QUERY = `
I want you to act as an expert in translating Youtube videos from any languages to {0}.
Now, translate the following content:
"{1}"
`

export {
  CHAT_URL,
  CHAT_ENDPOINTS,
  CHAT_MODEL,
  SUMMARY_QUERY,
  TRANSLATE_QUERY
}
