import { useState } from 'react'
import Dashboard from './screens/Dashboard.jsx'
import DocumentEditor from './screens/DocumentEditor.jsx'
import DocumentPreview from './screens/DocumentPreview.jsx'
import ClientManager from './screens/ClientManager.jsx'

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

  function goBack() {
    setScreen('dashboard')
    setEditingDoc(null)
    setPreviewDoc(null)
  }

  if (screen === 'editor') {
    return (
      <DocumentEditor
        doc={editingDoc}
        onBack={goBack}
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
      onClients={() => setScreen('clients')}
    />
  )
}
