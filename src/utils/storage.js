const DOCS_KEY = 'cleanik_documents'
const CLIENTS_KEY = 'cleanik_clients'

export function loadDocuments() {
  try {
    return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveDocuments(docs) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
}

export function loadClients() {
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveClients(clients) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

export function generateDocNumber(type, docs) {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const prefix = `RK${yy}${mm}${dd}`
  const existing = docs.filter(d => d.number.startsWith(prefix))
  const seq = String(existing.length + 1).padStart(2, '0')
  return `${prefix}${seq}`
}

export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d} / ${m} / ${y}`
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}
