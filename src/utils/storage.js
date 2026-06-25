const DOCS_KEY    = 'cleanik_documents'
const CLIENTS_KEY = 'cleanik_clients'

export function loadDocuments() {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]') }
  catch { return [] }
}

export function saveDocuments(docs) {
  try { localStorage.setItem(DOCS_KEY, JSON.stringify(docs)) }
  catch (e) { console.warn('Storage full:', e) }
}

export function loadClients() {
  try { return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]') }
  catch { return [] }
}

export function saveClients(clients) {
  try { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)) }
  catch (e) { console.warn('Storage full:', e) }
}

export function generateDocNumber(type, docs) {
  const now = new Date()
  const yy  = String(now.getFullYear()).slice(2)
  const mm  = String(now.getMonth() + 1).padStart(2, '0')
  const dd  = String(now.getDate()).padStart(2, '0')
  const prefix   = `RK${yy}${mm}${dd}`
  // Guard: d.number might be undefined on old/corrupt data
  const existing = docs.filter(d => typeof d.number === 'string' && d.number.startsWith(prefix))
  const seq      = String(existing.length + 1).padStart(2, '0')
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
