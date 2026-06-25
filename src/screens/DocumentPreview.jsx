import { useState } from 'react'
import { ArrowLeft, Download, Share2, Home, Loader, ArrowRightLeft, Pencil } from 'lucide-react'
import { EMETTEUR, PAYMENT_INFO } from '../data/services.js'
import { exportDocumentToPDF, shareDocument } from '../utils/pdf.js'
import { formatDate, loadDocuments, saveDocuments } from '../utils/storage.js'

const STATUS_CONFIG = {
  pending:  { label: 'En attente', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  accepted: { label: 'Accepté',    bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
  refused:  { label: 'Refusé',     bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
}

export default function DocumentPreview({ doc, onBack, onBackDashboard, onEdit, onConvert, onStatusChange }) {
  const [loading,   setLoading]   = useState(false)
  const [localDoc,  setLocalDoc]  = useState(doc)
  const isDevis  = localDoc.type === 'devis'
  const filename = `${isDevis ? 'Devis' : 'Facture'}_${localDoc.number}_${(localDoc.client?.name || 'Client').replace(/\s+/g, '_')}.pdf`

  async function handleShare() {
    setLoading(true)
    try   { await shareDocument('doc-render', filename) }
    catch { await exportDocumentToPDF('doc-render', filename) }
    finally { setLoading(false) }
  }

  async function handleDownload() {
    setLoading(true)
    await exportDocumentToPDF('doc-render', filename)
    setLoading(false)
  }

  function changeStatus(status) {
    onStatusChange(localDoc.id, status)
    setLocalDoc(d => ({ ...d, status }))
  }

  const statusCfg = STATUS_CONFIG[localDoc.status || 'pending']

  return (
    <div className="app-screen flex flex-col bg-gray-100">

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#1E3A5F] to-[#3B9FD1] text-white pt-safe px-4 pb-3">
        <div className="flex items-center justify-between pt-3">
          <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={22} /></button>
          <span className="font-bold text-base">{isDevis ? 'Devis' : 'Facture'} {localDoc.number}</span>
          <button onClick={onBackDashboard} className="p-2"><Home size={22} /></button>
        </div>
      </div>

      {/* ── Action toolbar ── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex gap-2">
        <button onClick={handleShare} disabled={loading}
          className="flex-1 bg-[#3B9FD1] text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-50 text-sm">
          {loading ? <Loader size={16} className="animate-spin" /> : <Share2 size={16} />}
          Partager
        </button>
        <button onClick={handleDownload} disabled={loading}
          className="flex-1 bg-white text-[#3B9FD1] border border-[#3B9FD1] font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-50 text-sm">
          {loading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          PDF
        </button>
        <button onClick={onEdit}
          className="w-12 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center active:bg-gray-200">
          <Pencil size={16} />
        </button>
      </div>

      {/* ── Devis-only: status + convert ── */}
      {isDevis && (
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium w-14 flex-shrink-0">Statut</span>
            <div className="flex gap-2 flex-1">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => changeStatus(key)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={{
                    background: cfg.bg, color: cfg.color,
                    borderColor: (localDoc.status || 'pending') === key ? cfg.border : 'transparent',
                    opacity:     (localDoc.status || 'pending') === key ? 1 : 0.55,
                    transform:   (localDoc.status || 'pending') === key ? 'scale(1.03)' : 'scale(1)',
                  }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onConvert(localDoc)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm active:opacity-80">
            <ArrowRightLeft size={16} />
            Convertir en Facture
          </button>
        </div>
      )}

      {/* ── Document render (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-2 py-4 pb-6">
        <div id="doc-render" className="bg-white shadow-lg mx-auto max-w-2xl rounded-sm">
          <DocContent doc={localDoc} />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   DocContent — the actual printable document
───────────────────────────────────────────────────────── */
function DocContent({ doc }) {
  const isDevis = doc.type === 'devis'
  const lines   = doc.lines || []
  const dep     = doc.deplacement || { offert: true, price: '' }
  const depOffert = dep.offert !== false
  const depPrice  = parseFloat(dep.price || 0)
  const total     = doc.total || 0
  const vehicle   = doc.vehicle

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', fontSize: 13 }}>

      {/* Blue header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A5F 0%, #3B9FD1 50%, #3B9FD1 100%)',
        padding: '40px 48px 32px', position: 'relative', minHeight: 180
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 150, height: 150,
          background: 'rgba(20,40,70,0.5)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }} />
        <h1 style={{ color: '#fff', fontSize: 54, fontWeight: 900, margin: 0, letterSpacing: 2, position: 'relative', zIndex: 1 }}>
          {isDevis ? 'DEVIS' : 'FACTURE'}
        </h1>
        <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
          <p style={headerLine}> DATE : {formatDate(doc.date)}</p>
          {vehicle?.plate && (
            <p style={headerLine}>
              VÉHICULE : {vehicle.plate}{vehicle.model ? ` — ${vehicle.model}` : ''}
            </p>
          )}
          {!isDevis && doc.affaire && <p style={headerLine}>N°AFFAIRE : {doc.affaire}</p>}
          {!isDevis && doc.bon     && <p style={headerLine}>N°BON : {doc.bon}</p>}
          <p style={{ ...headerLine, color: '#fff', fontSize: 15, fontWeight: 900, margin: 0 }}>
            {isDevis ? 'DEVIS' : 'FACTURE'} N° : {doc.number}
          </p>
        </div>
      </div>

      {/* Emetteur / Destinataire */}
      <div style={{ background: '#EAF4FB', padding: '22px 48px', display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <p style={sectionTitle}>ÉMETTEUR :</p>
          <p style={bold13}>{EMETTEUR.name}</p>
          <p style={small}>N° SIRET : {EMETTEUR.siret}</p>
          <p style={small}>{EMETTEUR.email}</p>
          <p style={{ ...small, margin: 0 }}>{EMETTEUR.phone}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={sectionTitle}>DESTINATAIRE :</p>
          {doc.client?.name    && <p style={{ ...bold13, textDecoration: 'underline' }}>{doc.client.name}</p>}
          {doc.client?.address && <p style={small}>{doc.client.address}</p>}
          {doc.client?.city    && <p style={small}>{doc.client.city}</p>}
          {doc.client?.phone   && <p style={small}>{doc.client.phone}</p>}
          {doc.client?.email   && <p style={{ ...small, margin: 0 }}>{doc.client.email}</p>}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 32px 28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr style={{ background: '#3B9FD1' }}>
              <th style={{ ...th, textAlign: 'left',   width: '50%' }}>Description :</th>
              <th style={{ ...th, textAlign: 'center', width: '18%' }}>Prix Unitaire :</th>
              <th style={{ ...th, textAlign: 'center', width: '14%' }}>Quantité :</th>
              <th style={{ ...th, textAlign: 'right',  width: '18%' }}>Total :</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={line.id || i} style={{ background: i % 2 === 1 ? '#F0F7FC' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '11px 14px', fontSize: 12, verticalAlign: 'top' }}>{line.description}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>
                  {parseFloat(line.unitPrice) > 0 ? `${parseFloat(line.unitPrice).toFixed(2)} €` : '-'}
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>{line.qty}</td>
                <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>
                  {parseFloat(line.total) > 0 ? `${parseFloat(line.total).toFixed(2)} €` : '-'}
                </td>
              </tr>
            ))}

            {/* Déplacement */}
            <tr style={{ background: lines.length % 2 === 1 ? '#fff' : '#F0F7FC', borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '11px 14px', fontSize: 12 }}>Déplacement</td>
              <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>
                {depOffert ? '-' : `${depPrice.toFixed(2)} €`}
              </td>
              <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>1</td>
              <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'right', fontWeight: 700 }}>
                {depOffert ? 'OFFERT' : `${depPrice.toFixed(2)} €`}
              </td>
            </tr>

            {/* Empty rows */}
            {[...Array(Math.max(0, 4 - lines.length))].map((_, i) => (
              <tr key={`e${i}`} style={{ background: (lines.length + 1 + i) % 2 === 1 ? '#fff' : '#F0F7FC', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '11px 14px', height: 36 }} /><td /><td /><td />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingRight: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <span style={{ fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL :</span>
            <span style={{ fontWeight: 900, fontSize: 16 }}>{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Règlement (facture) */}
        {!isDevis && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>RÈGLEMENT :</p>
            <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Par virement bancaire :</p>
            <p style={small}>Titulaire du compte : {PAYMENT_INFO.titulaire}</p>
            <p style={small}>Banque : {PAYMENT_INFO.banque}</p>
            <p style={small}>IBAN : {PAYMENT_INFO.iban}</p>
            <p style={{ ...small, marginBottom: 16 }}>BIC : {PAYMENT_INFO.bic}</p>
            <p style={{ fontWeight: 700, fontSize: 11 }}>TVA non applicable, art. 293 B du CGI</p>
          </div>
        )}

        {/* Signature (devis) */}
        {isDevis && (
          <div style={{ marginTop: 36 }}>
            <p style={{ fontWeight: 700, fontSize: 12, margin: '0 0 2px' }}>Signature suivie de la mention</p>
            <p style={{ fontWeight: 700, fontSize: 12, margin: 0 }}>"bon pour accord"</p>
            <div style={{ height: 64 }} />
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div style={{ height: 14, background: '#3B9FD1' }} />
    </div>
  )
}

/* Shared inline style objects */
const headerLine  = { color: '#cde8f5', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }
const sectionTitle = { fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#333', marginBottom: 8, margin: '0 0 8px' }
const bold13       = { fontWeight: 800, fontSize: 13, margin: '0 0 3px' }
const small        = { fontSize: 11, margin: '0 0 2px', color: '#444' }
const th           = { color: '#fff', padding: '10px 14px', fontSize: 12, fontWeight: 700 }
