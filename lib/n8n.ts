import wf from '@/n8n-zoom-workflow.json'

const endpoint = process.env.N8N_ENDPOINT || ''
const apiKey = process.env.N8N_API_KEY || ''
let ready = false

export async function ensureWorkflow(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
  if (envUrl) return envUrl
  if (!endpoint || !apiKey) return ''

  if (!ready) {
    try {
      const res = await fetch(`${endpoint}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': apiKey },
        body: JSON.stringify(wf),
      })
      if (res.ok || res.status === 409) ready = true
    } catch {
      // n8n unreachable → caller falls through to mock
    }
  }

  const base = endpoint.replace(/\/api\/v\d+\/?$/, '')
  return `${base}/webhook/vene-hire-interview-created`
}
