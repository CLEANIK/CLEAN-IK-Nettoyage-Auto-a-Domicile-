import { useState, useEffect } from 'react'
import { loadDocuments, saveDocuments } from '../utils/storage.js'
import { FileText, FilePlus, Users, ChevronRight, Trash2, ArrowRightLeft, TrendingUp } from 'lucide-react'

const STATUS_CONFIG = {
  pending:  { label: 'En attente', bg: 'bg-amber-100',  text: 'text-amber-700'  },
  accepted: { label: 'Accepté',    bg: 'bg-green-100',  text: 'text-green-700'  },
  refused:  { label: 'Refusé',     bg: 'bg-red-100',    text: 'text-red-600'    },
}

export default function Dashboard({ onNew, onEdit, onPreview, onConvert, onClients, onStatusChange }) {
  const [docs, setDocs]               = useState([])
  const [tab, setTab]                 = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [statusPicker, setStatusPicker]   = useState(null)

  useEffect(() => { setDocs(loadDocuments()) }, [])

  function handleDelete(id) {
    const updated = docs.filter(d => d.id !== id)
    saveDocuments(updated)
    setDocs(updated)
    setConfirmDelete(null)
  }

  function handleStatusChange(id, status) {
    const updated = onStatusChange(id, status)
    setDocs(updated)
    setStatusPicker(null)
  }

  const filtered = tab === 'all' ? docs : docs.filter(d => d.type === tab)
  const sorted   = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalDevis    = docs.filter(d => d.type === 'devis').length
  const totalFactures = docs.filter(d => d.type === 'facture').length
  const caTotal       = docs.filter(d => d.type === 'facture').reduce((s, d) => s + (d.total || 0), 0)

  return (
    <div className="app-screen flex flex-col bg-gray-50">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-br from-[#1E3A5F] to-[#3B9FD1] text-white pt-safe px-4 pb-5">
        <div className="flex items-center justify-between mb-4 pt-3">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">CLEAN'IK</h1>
            <p className="text-blue-100 text-sm">Devis & Factures</p>
          </div>
          <button onClick={onClients}
            className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 text-sm active:bg-white/30">
            <Users size={16} /><span>Clients</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 bg-white/15 rounded-2xl p-3 text-center">
            <div className="text-xl font-bold">{totalDevis}</div>
            <div className="text-xs text-blue-100">Devis</div>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl p-3 text-center">
            <div className="text-xl font-bold">{totalFactures}</div>
            <div className="text-xs text-blue-100">Factures</div>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp size={13} className="text-blue-200 flex-shrink-0" />
              <span className="text-xl font-bold">{caTotal.toFixed(0)}€</span>
            </div>
            <div className="text-xs text-blue-100">CA</div>
          </div>
        </div>
      </div>

      {/* ── New document buttons ── */}
      <div className="flex-shrink-0 px-4 -mt-4 flex gap-3">
        <button onClick={() => onNew('devis')}
          className="flex-1 bg-white rounded-2xl shadow-md p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FilePlus size={20} className="text-[#3B9FD1]" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-800 text-sm">Nouveau Devis</div>
            <div className="text-xs text-gray-400">Créer un devis</div>
          </div>
        </button>
        <button onClick={() => onNew('facture')}
          className="flex-1 bg-white rounded-2xl shadow-md p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-green-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-800 text-sm">Nouvelle Facture</div>
            <div className="text-xs text-gray-400">Créer une facture</div>
          </div>
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex-shrink-0 px-4 mt-5 flex gap-2">
        {['all', 'devis', 'facture'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t ? 'bg-[#3B9FD1] text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}>
            {t === 'all' ? 'Tous' : t === 'devis' ? 'Devis' : 'Factures'}
          </button>
        ))}
      </div>

      {/* ── Document list (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 pb-6 space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun document</p>
            <p className="text-xs mt-1">Créez votre premier devis ou facture</p>
          </div>
        ) : (
          sorted.map(doc => {
            const statusCfg = doc.type === 'devis' ? (STATUS_CONFIG[doc.status || 'pending']) : null
            return (
              <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Main row */}
                <div className="p-4 flex items-center gap-3 active:bg-gray-50 cursor-pointer"
                  onClick={() => onPreview(doc)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.type === 'devis' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <FileText size={18} className={doc.type === 'devis' ? 'text-[#3B9FD1]' : 'text-green-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        doc.type === 'devis' ? 'bg-blue-100 text-[#3B9FD1]' : 'bg-green-100 text-green-700'
                      }`}>
                        {doc.type === 'devis' ? 'DEVIS' : 'FACTURE'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{doc.number}</span>
                      {statusCfg && (
                        <button
                          onClick={e => { e.stopPropagation(); setStatusPicker(statusPicker === doc.id ? null : doc.id) }}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label} ▾
                        </button>
                      )}
                    </div>
                    <div className="font-semibold text-gray-800 text-sm mt-0.5 truncate">
                      {doc.client?.name || 'Client non défini'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <span>{doc.date ? doc.date.split('-').reverse().join('/') : ''}</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-600">{(doc.total || 0).toFixed(2)}€</span>
                      {doc.vehicle?.plate && (
                        <><span>·</span><span className="font-mono uppercase">{doc.vehicle.plate}</span></>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                </div>

                {/* Quick status picker */}
                {statusPicker === doc.id && (
                  <div className="px-4 pb-3 flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button key={key} onClick={() => handleStatusChange(doc.id, key)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${cfg.bg} ${cfg.text} ${
                          (doc.status || 'pending') === key ? 'ring-2 ring-offset-1 ring-current' : 'opacity-60'
                        }`}>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action bar */}
                <div className="border-t border-gray-50 flex">
                  <button onClick={() => onEdit(doc)}
                    className="flex-1 py-2.5 text-xs text-[#3B9FD1] font-medium text-center active:bg-blue-50">
                    Modifier
                  </button>
                  {doc.type === 'devis' && (
                    <>
                      <div className="w-px bg-gray-100" />
                      <button onClick={() => onConvert(doc)}
                        className="flex-1 py-2.5 text-xs text-green-600 font-medium flex items-center justify-center gap-1 active:bg-green-50">
                        <ArrowRightLeft size={12} />Facturer
                      </button>
                    </>
                  )}
                  <div className="w-px bg-gray-100" />
                  <button onClick={() => setConfirmDelete(doc.id)}
                    className="px-5 py-2.5 active:bg-red-50">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Delete modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center sm:justify-center z-50">
          <div className="bg-white w-full sm:max-w-sm sm:mx-4 rounded-t-3xl sm:rounded-3xl p-6 slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Supprimer ?</h3>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium">
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-medium">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
