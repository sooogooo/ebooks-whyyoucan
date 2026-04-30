import { supabase } from './supabase'

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`

export async function askAI({ messages, mode = 'chat', chapterTitle, chapterContent, selectedText, role, persist = true }) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, mode, chapterTitle, chapterContent, selectedText, role, persist: persist && !!session }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`AI request failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.answer || ''
}
