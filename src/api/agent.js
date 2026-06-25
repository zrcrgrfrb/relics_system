import { API_BASE_URL } from '@/utils/request'
import { clearAdminSession, getAdminToken } from '@/utils/auth'

const STREAM_URL = `${API_BASE_URL}/api/agent/chat/stream`

export async function streamAgentChat({ messages, context, signal, onDelta, onDone, onError }) {
  const token = getAdminToken()
  const response = await fetch(STREAM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    },
    body: JSON.stringify({ messages, context }),
    signal
  })

  if (response.status === 401) {
    clearAdminSession()
    throw new Error('登录状态已过期，请重新登录')
  }

  if (!response.ok) {
    throw new Error(`智能体接口异常：${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
// eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const chunks = buffer.split(/\r?\n\r?\n/)
    buffer = chunks.pop() || ''
    chunks.forEach(chunk => handleSseChunk(chunk, { onDelta, onDone, onError }))
  }

  if (buffer.trim()) {
    handleSseChunk(buffer, { onDelta, onDone, onError })
  }
}

function handleSseChunk(chunk, handlers) {
  const lines = chunk.split(/\r?\n/)
  let event = 'message'
  const dataLines = []

  lines.forEach(line => {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
  })

  const data = dataLines.join('\n')
  if (!data) return

  if (event === 'delta') {
    handlers.onDelta && handlers.onDelta(data)
  } else if (event === 'done') {
    handlers.onDone && handlers.onDone()
  } else if (event === 'error') {
    handlers.onError && handlers.onError(data)
  }
}
