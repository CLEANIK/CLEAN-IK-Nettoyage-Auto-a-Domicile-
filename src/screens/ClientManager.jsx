import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, User } from 'lucide-react'
import { loadClients, saveClients } from '../utils/storage.js'

const emptyClient = { name: '', address: '', city: '', phone: '', email: '' }

export default function ClientManager({ onBack }) {
  const [clients, setClients] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyClient)

  useEffect(() => {
    setClients(loadClients())
  }, [])

  function openNew() {
    setForm(emptyClient)
    setEditing('new')
  }

  function openEdit(c) {
    setForm(c)
    setEditing(c.id)
  }

  function save() {
    let updated
    if (editing === 'new') {
      updated = [...clients, { ...form, id: String(Date.now()) }]
    } else {
      updated = clients.map(c => c.id === editing ? { ...form, id: editing } : c)
    }
    saveClients(updated)
    setClients(updated)
    setEditing(null)
  }

  function remove(id) {
    const updated = clients.filter(c => c.id !== id)
    saveClients(updated)
    setClients(updated)
  }

  if (editing !== null) {
    return (
      <div className="app-screen flex flex-col bg-gray-50">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#1E3A5F] to-[#3B9FD1] text-white pt-safe px-4 pb-4">
          <div className="flex items-center justify-between pt-3">
            <button onClick={() => setEditing(null)} className="p-2 -ml-2">
              <ArrowLeft size={22} />
            </button>
            <h2 className="font-bold text-lg">
              {editing === 'new' ? 'Nouveau client' : 'Modifier client'}
            </h2>
            <button onClick={save} className="bg-white/20 rounded-xl px-4 py-2 text-sm font-bold">
              Sauver
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">
          {[
            { key: 'name', label: 'Nom / Société', type: 'text', placeholder: 'APAVE EXPLOITATION...' },
            { key: 'address', label: 'Adresse', type: 'text', placeholder: '6 Rue du Général...' },
            { key: 'city', label: 'Ville / CP', type: 'text', placeholder: '92400 Courbevoie' },
            { key: 'phone', label: 'Téléphone', type: 'tel', placeholder: '06 00 00 00 00' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'contact@exemple.fr' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="bg-white rounded-2xl p-4">
              <label className="text-xs text-gray-400 mb-1 block">{label}</label>
              <input
                className="input-field w-full"
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen flex flex-col bg-gray-50">
      <div className="flex-shrink-0 bg-gradient-to-r from-[#1E3A5F] to-[#3B9FD1] text-white pt-safe px-4 pb-4">
        <div className="flex items-center justify-between pt-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={22} />
          </button>
          <h2 className="font-bold text-lg">Clients</h2>
          <button onClick={openNew} className="bg-white/20 rounded-xl px-3 py-2 text-sm flex items-center gap-1">
            <Plus size={16} />
            Nouveau
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-6">
        {clients.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun client sauvegardé</p>
            <p className="text-xs mt-1">Ajoutez vos clients fréquents</p>
          </div>
        ) : (
          clients.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className="p-4 flex items-center gap-3 active:bg-gray-50 cursor-pointer"
                onClick={() => openEdit(c)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-[#3B9FD1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800">{c.name}</div>
                  {c.city && <div className="text-xs text-gray-400 mt-0.5">{c.city}</div>}
                  {c.phone && <div className="text-xs text-gray-400">{c.phone}</div>}
                </div>
                <button onClick={e => { e.stopPropagation(); remove(c.id) }} className="p-2 text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
