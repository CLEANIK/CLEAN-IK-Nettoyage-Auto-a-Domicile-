import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, Plus, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { SERVICES_CATALOG } from '../data/services.js'
import { loadDocuments, saveDocuments, loadClients, generateDocNumber, todayISO } from '../utils/storage.js'

export default function DocumentEditor({ doc, onBack, onPreview }) {
  const isNew = doc.isNew
  const type = doc.type

  const [number, setNumber] = useState('')
  const [date, setDate] = useState(todayISO())
  const [affaire, setAffaire] = useState('')
  const [bon, setBon] = useState('')
  const [client, setClient] = useState({ name: '', address: '', city: '', phone: '', email: '' })
  const [lines, setLines] = useState([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [openCategory, setOpenCategory] = useState(null)
  const [showClientPicker, setShowClientPicker] = useState(false)
  const [savedClients, setSavedClients] = useState([])

  useEffect(() => {
    const docs = loadDocuments()
    setSavedClients(loadClients())

    if (isNew) {
      setNumber(generateDocNumber(type, docs))
    } else {
      setNumber(doc.number || '')
      setDate(doc.date || todayISO())
      setAffaire(doc.affaire || '')
      setBon(doc.bon || '')
      setClient(doc.client || { name: '', address: '', city: '', phone: '', email: '' })
      setLines(doc.lines || [])
    }
  }, [])

  function addLine(service) {
    const newLine = {
      id: Date.now(),
      description: service.label,
      unitPrice: service.price,
      qty: 1,
      total: service.price,
      custom: service.custom || false,
    }
    setLines(prev => [...prev, newLine])
    setShowCatalog(false)
  }

  function addCustomLine() {
    const newLine = {
      id: Date.now(),
      description: '',
      unitPrice: 0,
      qty: 1,
      total: 0,
      custom: true,
    }
    setLines(prev => [...prev, newLine])
    setShowCatalog(false)
  }

  function updateLine(id, field, value) {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const updated = { ...l, [field]: value }
      if (field === 'unitPrice' || field === 'qty') {
        updated.total = parseFloat(updated.unitPrice || 0) * parseFloat(updated.qty || 0)
      }
      return updated
    }))
  }

  function removeLine(id) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const total = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0)

  function buildDoc() {
    return {
      id: doc.id || String(Date.now()),
      type,
      number,
      date,
      affaire,
      bon,
      client,
      lines,
      total,
    }
  }

  function handleSaveAndPreview() {
    const built = buildDoc()
    const docs = loadDocuments()
    const existing = docs.findIndex(d => d.id === built.id)
    if (existing >= 0) docs[existing] = built
    else docs.push(built)
    saveDocuments(docs)
    onPreview(built)
  }

  function pickClient(c) {
    setClient(c)
    setShowClientPicker(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#3B9FD1] text-white pt-12 pb-4 px-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={22} />
          </button>
          <h2 className="font-bold text-lg">
            {type === 'devis' ? 'Nouveau Devis' : 'Nouvelle Facture'}
          </h2>
          <button
            onClick={handleSaveAndPreview}
            className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <Eye size={16} />
            <span>Aperçu</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Document info */}
        <Section title="Informations">
          <Row label="N°">
            <input
              className="input-field"
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="RK250101"
            />
          </Row>
          <Row label="Date">
            <input
              className="input-field"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </Row>
          {type === 'facture' && (
            <>
              <Row label="N° Affaire">
                <input
                  className="input-field"
                  value={affaire}
                  onChange={e => setAffaire(e.target.value)}
                  placeholder="ATELIER"
                />
              </Row>
              <Row label="N° Bon">
                <input
                  className="input-field"
                  value={bon}
                  onChange={e => setBon(e.target.value)}
                  placeholder="BC01541"
                />
              </Row>
            </>
          )}
        </Section>

        {/* Client */}
        <Section title="Destinataire">
          {savedClients.length > 0 && (
            <button
              onClick={() => setShowClientPicker(true)}
              className="w-full flex items-center gap-2 text-[#3B9FD1] text-sm font-medium mb-3"
            >
              <Users size={16} />
              Choisir un client sauvegardé
            </button>
          )}
          <Row label="Nom / Société">
            <input
              className="input-field"
              value={client.name}
              onChange={e => setClient(c => ({ ...c, name: e.target.value }))}
              placeholder="Nom du client"
            />
          </Row>
          <Row label="Adresse">
            <input
              className="input-field"
              value={client.address}
              onChange={e => setClient(c => ({ ...c, address: e.target.value }))}
              placeholder="Rue..."
            />
          </Row>
          <Row label="Ville / CP">
            <input
              className="input-field"
              value={client.city}
              onChange={e => setClient(c => ({ ...c, city: e.target.value }))}
              placeholder="31000 Toulouse"
            />
          </Row>
          <Row label="Téléphone">
            <input
              className="input-field"
              type="tel"
              value={client.phone}
              onChange={e => setClient(c => ({ ...c, phone: e.target.value }))}
              placeholder="06 00 00 00 00"
            />
          </Row>
          <Row label="Email">
            <input
              className="input-field"
              type="email"
              value={client.email}
              onChange={e => setClient(c => ({ ...c, email: e.target.value }))}
              placeholder="contact@exemple.fr"
            />
          </Row>
        </Section>

        {/* Lines */}
        <Section title="Prestations">
          {lines.map((line, i) => (
            <div key={line.id} className="mb-4 bg-gray-50 rounded-2xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <textarea
                  className="flex-1 input-field resize-none text-sm"
                  rows={2}
                  value={line.description}
                  onChange={e => updateLine(line.id, 'description', e.target.value)}
                  placeholder="Description de la prestation..."
                />
                <button onClick={() => removeLine(line.id)} className="p-2 text-red-400 mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Prix unitaire (€)</label>
                  <input
                    className="input-field text-right"
                    type="number"
                    inputMode="decimal"
                    value={line.unitPrice}
                    onChange={e => updateLine(line.id, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <label className="text-xs text-gray-400 mb-1 block">Quantité</label>
                  <input
                    className="input-field text-right"
                    type="number"
                    inputMode="numeric"
                    value={line.qty}
                    onChange={e => updateLine(line.id, 'qty', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-400 mb-1 block">Total</label>
                  <div className="input-field bg-white text-right font-semibold text-[#3B9FD1]">
                    {parseFloat(line.total || 0).toFixed(2)}€
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Déplacement (always shown, read-only) */}
          <div className="mb-4 bg-blue-50 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Déplacement</span>
            <span className="text-sm font-bold text-[#3B9FD1]">OFFERT</span>
          </div>

          <button
            onClick={() => setShowCatalog(true)}
            className="w-full py-3 border-2 border-dashed border-[#3B9FD1] rounded-2xl text-[#3B9FD1] font-medium flex items-center justify-center gap-2 active:bg-blue-50"
          >
            <Plus size={18} />
            Ajouter une prestation
          </button>
        </Section>

        {/* Total */}
        <div className="mx-4 mb-4 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <span className="font-bold text-gray-700 text-lg">TOTAL</span>
          <span className="font-bold text-2xl text-[#3B9FD1]">{total.toFixed(2)} €</span>
        </div>
      </div>

      {/* Bottom save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe">
        <button
          onClick={handleSaveAndPreview}
          className="w-full bg-[#3B9FD1] text-white font-bold py-4 rounded-2xl text-base active:opacity-90 flex items-center justify-center gap-2"
        >
          <Eye size={20} />
          Enregistrer & Aperçu
        </button>
      </div>

      {/* Catalog bottom sheet */}
      {showCatalog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Catalogue</h3>
              <button onClick={() => setShowCatalog(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <button
                onClick={addCustomLine}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Ligne personnalisée</span>
              </button>

              {SERVICES_CATALOG.map(cat => (
                <div key={cat.category}>
                  <button
                    onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
                    className="w-full flex items-center justify-between px-2 py-2"
                  >
                    <span className="font-semibold text-[#1E3A5F] text-sm uppercase tracking-wide">
                      {cat.category}
                    </span>
                    {openCategory === cat.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openCategory === cat.category && (
                    <div className="space-y-2 mt-1">
                      {cat.items.map(svc => (
                        <button
                          key={svc.id}
                          onClick={() => addLine(svc)}
                          className="w-full text-left bg-gray-50 rounded-2xl p-3 active:bg-blue-50"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800 text-sm">{svc.label}</span>
                            <span className="text-[#3B9FD1] font-bold text-sm ml-2">
                              {svc.price > 0 ? `${svc.price}€` : 'Sur mesure'}
                            </span>
                          </div>
                          {svc.details && (
                            <p className="text-xs text-gray-400 mt-1">{svc.details}</p>
                          )}
                          {svc.duration && (
                            <p className="text-xs text-blue-400 mt-0.5">⏱ {svc.duration}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Client picker bottom sheet */}
      {showClientPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[70vh] flex flex-col slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Choisir un client</h3>
              <button onClick={() => setShowClientPicker(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {savedClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => pickClient(c)}
                  className="w-full text-left bg-gray-50 rounded-2xl p-4 active:bg-blue-50"
                >
                  <div className="font-semibold text-gray-800">{c.name}</div>
                  {c.address && <div className="text-xs text-gray-400 mt-0.5">{c.address}</div>}
                  {c.city && <div className="text-xs text-gray-400">{c.city}</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-gray-600 text-xs uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center gap-3 mb-3 last:mb-0">
      <label className="text-xs text-gray-400 w-24 flex-shrink-0">{label}</label>
      {children}
    </div>
  )
}
