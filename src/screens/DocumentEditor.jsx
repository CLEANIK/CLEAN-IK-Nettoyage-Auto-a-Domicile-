import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, Plus, Trash2, ChevronDown, ChevronUp, Search, UserPlus, Check, Car } from 'lucide-react'
import { SERVICES_CATALOG } from '../data/services.js'
import { loadDocuments, saveDocuments, loadClients, saveClients, generateDocNumber, todayISO } from '../utils/storage.js'

const emptyClient  = { name: '', address: '', city: '', phone: '', email: '' }
const emptyVehicle = { plate: '', model: '' }

export default function DocumentEditor({ doc, onBack, onPreview }) {
  if (!doc) return null

  const isNew = doc.isNew
  const type  = doc.type

  const [number,      setNumber]      = useState('')
  const [date,        setDate]        = useState(todayISO())
  const [affaire,     setAffaire]     = useState('')
  const [bon,         setBon]         = useState('')
  const [client,      setClient]      = useState(emptyClient)
  const [vehicle,     setVehicle]     = useState(emptyVehicle)
  const [lines,       setLines]       = useState([])
  const [deplacement, setDeplacement] = useState({ offert: true, price: '' })

  const [showCatalog,      setShowCatalog]      = useState(false)
  const [openCategory,     setOpenCategory]     = useState(null)
  const [showClientSheet,  setShowClientSheet]  = useState(false)
  const [clientSearch,     setClientSearch]     = useState('')
  const [savedClients,     setSavedClients]     = useState([])
  const [addingClient,     setAddingClient]     = useState(false)
  const [newClientForm,    setNewClientForm]    = useState(emptyClient)
  const [clientSaved,      setClientSaved]      = useState(false)

  useEffect(() => {
    const docs = loadDocuments()
    setSavedClients(loadClients())
    if (isNew) {
      setNumber(generateDocNumber(type, docs))
    } else {
      setNumber(doc.number  || '')
      setDate(doc.date      || todayISO())
      setAffaire(doc.affaire || '')
      setBon(doc.bon         || '')
      setClient(doc.client   || emptyClient)
      setVehicle(doc.vehicle || emptyVehicle)
      setLines(doc.lines     || [])
      setDeplacement(doc.deplacement || { offert: true, price: '' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lines ──────────────────────────────────────────────
  function addLine(service) {
    setLines(prev => [...prev, {
      id: Date.now(), description: service.label,
      unitPrice: service.price, qty: 1, total: service.price,
    }])
    setShowCatalog(false)
  }

  function addCustomLine() {
    setLines(prev => [...prev, { id: Date.now(), description: '', unitPrice: 0, qty: 1, total: 0 }])
    setShowCatalog(false)
  }

  function updateLine(id, field, value) {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l
      const u = { ...l, [field]: value }
      if (field === 'unitPrice' || field === 'qty')
        u.total = parseFloat(u.unitPrice || 0) * parseFloat(u.qty || 0)
      return u
    }))
  }

  function removeLine(id) {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const deplacementAmount = deplacement.offert ? 0 : parseFloat(deplacement.price || 0)
  const total = lines.reduce((s, l) => s + (parseFloat(l.total) || 0), 0) + deplacementAmount

  // ── Contacts ───────────────────────────────────────────
  function pickClient(c) {
    setClient({ name: c.name, address: c.address, city: c.city, phone: c.phone, email: c.email })
    setShowClientSheet(false); setClientSearch(''); setAddingClient(false)
  }

  function saveNewClientAndPick() {
    if (!newClientForm.name.trim()) return
    const entry   = { ...newClientForm, id: String(Date.now()) }
    const updated = [...savedClients, entry]
    saveClients(updated); setSavedClients(updated)
    pickClient(entry); setNewClientForm(emptyClient); setAddingClient(false)
  }

  function saveCurrentClientToBook() {
    if (!client.name.trim()) return
    const entry   = { ...client, id: String(Date.now()) }
    const updated = [...savedClients, entry]
    saveClients(updated); setSavedClients(updated)
    setClientSaved(true); setTimeout(() => setClientSaved(false), 2000)
  }

  const filteredClients = savedClients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(clientSearch.toLowerCase())
  )

  // ── Build & save ───────────────────────────────────────
  function buildDoc() {
    return {
      id: doc.id || String(Date.now()),
      type, number, date, affaire, bon,
      client, vehicle, lines, deplacement, total,
    }
  }

  function handleSaveAndPreview() {
    const built = buildDoc()
    const docs  = loadDocuments()
    const idx   = docs.findIndex(d => d.id === built.id)
    if (idx >= 0) docs[idx] = built; else docs.push(built)
    saveDocuments(docs)
    onPreview(built)
  }

  // ─────────────────────────────────────────────────────────
  return (
    /*
     * KEY CHANGE: h-screen + flex flex-col
     * The bottom CTA is a flex-shrink-0 footer, NOT fixed.
     * This works on both mobile AND in a desktop centered container.
     */
    <div className="app-screen flex flex-col bg-gray-50">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#1E3A5F] to-[#3B9FD1] text-white pt-safe px-4 pb-4">
        <div className="flex items-center justify-between pt-3">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={22} /></button>
          <h2 className="font-bold text-lg">
            {isNew ? (type === 'devis' ? 'Nouveau Devis' : 'Nouvelle Facture')
                   : (type === 'devis' ? 'Modifier Devis' : 'Modifier Facture')}
          </h2>
          <button onClick={handleSaveAndPreview}
            className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-2 text-sm font-medium active:bg-white/30">
            <Eye size={16} /><span>Aperçu</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">

        <Section title="Informations">
          <Row label="N°">
            <input className="input-field" value={number} onChange={e => setNumber(e.target.value)} placeholder="RK260101" />
          </Row>
          <Row label="Date">
            <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </Row>
          {type === 'facture' && (
            <>
              <Row label="N° Affaire">
                <input className="input-field" value={affaire} onChange={e => setAffaire(e.target.value)} placeholder="ATELIER" />
              </Row>
              <Row label="N° Bon">
                <input className="input-field" value={bon} onChange={e => setBon(e.target.value)} placeholder="BC01541" />
              </Row>
            </>
          )}
        </Section>

        <Section title="Véhicule">
          <Row label="Immatriculation">
            <input className="input-field uppercase" value={vehicle.plate}
              onChange={e => setVehicle(v => ({ ...v, plate: e.target.value.toUpperCase() }))}
              placeholder="AB-123-CD" maxLength={9} />
          </Row>
          <Row label="Marque / Modèle">
            <input className="input-field" value={vehicle.model}
              onChange={e => setVehicle(v => ({ ...v, model: e.target.value }))}
              placeholder="Renault Clio, BMW X5..." />
          </Row>
        </Section>

        <Section title="Destinataire">
          <button
            onClick={() => { setShowClientSheet(true); setAddingClient(false); setClientSearch('') }}
            className="w-full flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-4 active:bg-blue-100">
            <Search size={16} className="text-[#3B9FD1]" />
            <span className="text-[#3B9FD1] text-sm font-medium">
              {savedClients.length > 0 ? 'Rechercher un contact...' : 'Créer un contact sauvegardé'}
            </span>
          </button>

          <Row label="Nom / Société">
            <input className="input-field" value={client.name}
              onChange={e => { setClient(c => ({ ...c, name: e.target.value })); setClientSaved(false) }}
              placeholder="Nom du client" />
          </Row>
          <Row label="Adresse">
            <input className="input-field" value={client.address}
              onChange={e => setClient(c => ({ ...c, address: e.target.value }))} placeholder="Rue..." />
          </Row>
          <Row label="Ville / CP">
            <input className="input-field" value={client.city}
              onChange={e => setClient(c => ({ ...c, city: e.target.value }))} placeholder="31000 Toulouse" />
          </Row>
          <Row label="Téléphone">
            <input className="input-field" type="tel" value={client.phone}
              onChange={e => setClient(c => ({ ...c, phone: e.target.value }))} placeholder="06 00 00 00 00" />
          </Row>
          <Row label="Email">
            <input className="input-field" type="email" value={client.email}
              onChange={e => setClient(c => ({ ...c, email: e.target.value }))} placeholder="contact@exemple.fr" />
          </Row>
          {client.name.trim() && (
            <button onClick={saveCurrentClientToBook}
              className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                clientSaved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}>
              {clientSaved ? <Check size={15} /> : <UserPlus size={15} />}
              {clientSaved ? 'Contact sauvegardé !' : 'Sauvegarder dans mes contacts'}
            </button>
          )}
        </Section>

        <Section title="Prestations">
          {lines.map(line => (
            <div key={line.id} className="mb-4 bg-gray-50 rounded-2xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <textarea
                  className="flex-1 input-field resize-none text-sm" rows={2}
                  value={line.description}
                  onChange={e => updateLine(line.id, 'description', e.target.value)}
                  placeholder="Description de la prestation..." />
                <button onClick={() => removeLine(line.id)} className="p-2 text-red-400 mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Prix (€)</label>
                  <input className="input-field text-right" type="number" inputMode="decimal"
                    value={line.unitPrice} onChange={e => updateLine(line.id, 'unitPrice', e.target.value)} />
                </div>
                <div className="w-20">
                  <label className="text-xs text-gray-400 mb-1 block">Qté</label>
                  <input className="input-field text-right" type="number" inputMode="numeric"
                    value={line.qty} onChange={e => updateLine(line.id, 'qty', e.target.value)} />
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

          {/* Déplacement */}
          <div className="mb-4 bg-blue-50 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                <Car size={15} className="text-[#3B9FD1]" /> Déplacement
              </span>
              <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
                <button onClick={() => setDeplacement(d => ({ ...d, offert: true }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    deplacement.offert ? 'bg-[#3B9FD1] text-white' : 'text-gray-400'
                  }`}>OFFERT</button>
                <button onClick={() => setDeplacement(d => ({ ...d, offert: false }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    !deplacement.offert ? 'bg-[#3B9FD1] text-white' : 'text-gray-400'
                  }`}>Payant</button>
              </div>
            </div>
            {!deplacement.offert && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 flex-shrink-0">Prix (€)</label>
                <input className="input-field text-right flex-1" type="number" inputMode="decimal"
                  value={deplacement.price}
                  onChange={e => setDeplacement(d => ({ ...d, price: e.target.value }))}
                  placeholder="0.00" />
              </div>
            )}
          </div>

          <button onClick={() => setShowCatalog(true)}
            className="w-full py-3 border-2 border-dashed border-[#3B9FD1] rounded-2xl text-[#3B9FD1] font-medium flex items-center justify-center gap-2 active:bg-blue-50">
            <Plus size={18} />Ajouter une prestation
          </button>
        </Section>

        {/* Total */}
        <div className="mx-4 mb-2 bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <span className="font-bold text-gray-700 text-lg">TOTAL</span>
          <span className="font-bold text-2xl text-[#3B9FD1]">{total.toFixed(2)} €</span>
        </div>
        <p className="text-center text-xs text-gray-400 mb-4">TVA non applicable, art. 293 B du CGI</p>
      </div>

      {/* ── Bottom CTA — flex-shrink-0, NOT fixed ── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 p-4 pb-safe">
        <button onClick={handleSaveAndPreview}
          className="w-full bg-[#3B9FD1] text-white font-bold py-4 rounded-2xl text-base active:opacity-90 flex items-center justify-center gap-2">
          <Eye size={20} />Enregistrer & Aperçu
        </button>
      </div>

      {/* ── Catalog bottom sheet ── */}
      {showCatalog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
          <div className="sheet-card bg-white rounded-t-3xl max-h-[85vh] flex flex-col slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Catalogue</h3>
              <button onClick={() => setShowCatalog(false)} className="text-gray-400 text-3xl leading-none pb-1 w-8 text-center">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              <button onClick={addCustomLine}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">
                <Plus size={18} /><span className="text-sm font-medium">Ligne personnalisée</span>
              </button>
              {SERVICES_CATALOG.map(cat => (
                <div key={cat.category}>
                  <button
                    onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
                    className="w-full flex items-center justify-between px-2 py-2">
                    <span className="font-semibold text-[#1E3A5F] text-sm uppercase tracking-wide">{cat.category}</span>
                    {openCategory === cat.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openCategory === cat.category && (
                    <div className="space-y-2 mt-1">
                      {cat.items.map(svc => (
                        <button key={svc.id} onClick={() => addLine(svc)}
                          className="w-full text-left bg-gray-50 rounded-2xl p-3 active:bg-blue-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800 text-sm">{svc.label}</span>
                            <span className="text-[#3B9FD1] font-bold text-sm ml-2">
                              {svc.price > 0 ? `${svc.price}€` : 'Sur mesure'}
                            </span>
                          </div>
                          {svc.details  && <p className="text-xs text-gray-400 mt-1">{svc.details}</p>}
                          {svc.duration && <p className="text-xs text-blue-400 mt-0.5">⏱ {svc.duration}</p>}
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

      {/* ── Contact bottom sheet ── */}
      {showClientSheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
          <div className="sheet-card bg-white rounded-t-3xl max-h-[85vh] flex flex-col slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Contacts</h3>
              <button onClick={() => { setShowClientSheet(false); setAddingClient(false); setClientSearch('') }}
                className="text-gray-400 text-3xl leading-none pb-1 w-8 text-center">×</button>
            </div>
            {!addingClient ? (
              <>
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5">
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input autoFocus
                      className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                      placeholder="Rechercher..." value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)} />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-2">
                  <button onClick={() => { setAddingClient(true); setNewClientForm(emptyClient) }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-[#3B9FD1] text-[#3B9FD1] mb-1">
                    <UserPlus size={18} /><span className="text-sm font-semibold">Nouveau contact</span>
                  </button>
                  {filteredClients.length === 0 && clientSearch ? (
                    <p className="text-center py-8 text-gray-400 text-sm">Aucun résultat pour "{clientSearch}"</p>
                  ) : (
                    filteredClients.map(c => (
                      <button key={c.id} onClick={() => pickClient(c)}
                        className="w-full text-left bg-gray-50 rounded-2xl p-4 active:bg-blue-50">
                        <div className="font-semibold text-gray-800">{c.name}</div>
                        {c.address && <div className="text-xs text-gray-400 mt-0.5">{c.address}</div>}
                        {c.city    && <div className="text-xs text-gray-400">{c.city}</div>}
                        {c.phone   && <div className="text-xs text-gray-400">{c.phone}</div>}
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                  <button onClick={() => setAddingClient(false)} className="text-[#3B9FD1] text-sm">‹ Retour</button>
                  <span className="font-semibold text-gray-700">Nouveau contact</span>
                </div>
                <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-3">
                  {[
                    { key: 'name',    label: 'Nom / Société *', type: 'text',  placeholder: 'APAVE EXPLOITATION...' },
                    { key: 'address', label: 'Adresse',         type: 'text',  placeholder: '6 Rue du Général...'   },
                    { key: 'city',    label: 'Ville / CP',      type: 'text',  placeholder: '92400 Courbevoie'      },
                    { key: 'phone',   label: 'Téléphone',       type: 'tel',   placeholder: '06 00 00 00 00'        },
                    { key: 'email',   label: 'Email',           type: 'email', placeholder: 'contact@exemple.fr'   },
                  ].map(({ key, label, type: t, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                      <input className="input-field" type={t} value={newClientForm[key]}
                        onChange={e => setNewClientForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder} />
                    </div>
                  ))}
                  <button onClick={saveNewClientAndPick} disabled={!newClientForm.name.trim()}
                    className="w-full bg-[#3B9FD1] text-white font-bold py-3.5 rounded-2xl mt-2 disabled:opacity-40 active:opacity-80">
                    Sauvegarder & Sélectionner
                  </button>
                </div>
              </>
            )}
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
      <label className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</label>
      {children}
    </div>
  )
}
