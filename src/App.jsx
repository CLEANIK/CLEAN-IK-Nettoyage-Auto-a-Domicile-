import { useState } from 'react'
import Dashboard from './screens/Dashboard.jsx'
import DocumentEditor from './screens/DocumentEditor.jsx'
import DocumentPreview from './screens/DocumentPreview.jsx'
import ClientManager from './screens/ClientManager.jsx'
import { loadDocuments, saveDocuments, generateDocNumber, todayISO } from './utils/storage.js'

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [editingDoc, setEditingDoc] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  function openNew(type) {
    setEditingDoc({ type, isNew: true })
    setScreen('editor')
  }

  function openEdit(doc) {
    setEditingDoc({ ...doc, isNew: false })
    setScreen('editor')
  }

  function openPreview(doc) {
    setPreviewDoc(doc)
    setScreen('preview')
  }

  function convertToFacture(devisDoc) {
    const docs = loadDocuments()
    const newDoc = {
      ...devisDoc,
      id: null,
      type: 'facture',
      isNew: true,
      number: generateDocNumber('facture', docs),
      date: todayISO(),
      affaire: '',
      bon: '',
      status: undefined,
    }
    setPreviewDoc(null)
    setEditingDoc(newDoc)
    setScreen('editor')
  }

  function goBack() {
    setScreen('dashboard')
    setEditingDoc(null)
    setPreviewDoc(null)
  }

  if (screen === 'editor') {
    return (
      <DocumentEditor
        doc={editingDoc}
        onBack={() => {
          if (previewDoc) setScreen('preview')
          else goBack()
        }}
        onPreview={openPreview}
      />
    )
  }

  if (screen === 'preview') {
    return (
      <DocumentPreview
        doc={previewDoc}
        onBack={() => {
          if (editingDoc) setScreen('editor')
          else goBack()
        }}
        onBackDashboard={goBack}
        onEdit={() => openEdit(previewDoc)}
        onConvert={convertToFacture}
        onStatusChange={(id, status) => {
          const docs = loadDocuments()
          const updated = docs.map(d => d.id === id ? { ...d, status } : d)
          saveDocuments(updated)
          setPreviewDoc(prev => ({ ...prev, status }))
        }}
      />
    )
  }

  if (screen === 'clients') {
    return <ClientManager onBack={goBack} />
  }

  return (
    <Dashboard
      onNew={openNew}
      onEdit={openEdit}
      onPreview={openPreview}
      onConvert={convertToFacture}
      onClients={() => setScreen('clients')}
      onStatusChange={(id, status) => {
        const docs = loadDocuments()
        const updated = docs.map(d => d.id === id ? { ...d, status } : d)
        saveDocuments(updated)
        return updated
      }}
    />
  )
}
