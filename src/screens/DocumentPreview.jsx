import { useState } from 'react'
import { ArrowLeft, Download, Share2, Home, Loader } from 'lucide-react'
import { EMETTEUR, PAYMENT_INFO } from '../data/services.js'
import { exportDocumentToPDF, shareDocument } from '../utils/pdf.js'
import { formatDate } from '../utils/storage.js'

export default function DocumentPreview({ doc, onBack, onBackDashboard }) {
  const [loading, setLoading] = useState(false)
  const isDevis = doc.type === 'devis'
  const filename = `${isDevis ? 'Devis' : 'Facture'}_${doc.number}_${doc.client?.name || 'Client'}.pdf`

  async function handleDownload() {
    setLoading(true)
    await exportDocumentToPDF('doc-render', filename)
    setLoading(false)
  }

  async function handleShare() {
    setLoading(true)
    await shareDocument('doc-render', filename)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#3B9FD1] text-white pt-12 pb-3 px-4 no-print">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={22} />
          </button>
          <span className="font-bold text-base">
            {isDevis ? 'Devis' : 'Facture'} {doc.number}
          </span>
          <button onClick={onBackDashboard} className="p-2">
            <Home size={22} />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 px-4 py-3 no-print">
        <button
          onClick={handleShare}
          disabled={loading}
          className="flex-1 bg-[#3B9FD1] text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-60"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Share2 size={18} />}
          Partager
        </button>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex-1 bg-white text-[#3B9FD1] border border-[#3B9FD1] font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-60"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Download size={18} />}
          PDF
        </button>
      </div>

      {/* Document preview */}
      <div className="flex-1 overflow-y-auto px-2 pb-8">
        <div className="bg-white shadow-lg mx-auto max-w-2xl" id="doc-render">
          <DocContent doc={doc} />
        </div>
      </div>
    </div>
  )
}

function DocContent({ doc }) {
  const isDevis = doc.type === 'devis'
  const lines = doc.lines || []
  const total = doc.total || 0

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#222' }}>
      {/* Header with blue background */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #3B9FD1 40%, #3B9FD1 100%)', padding: '40px 48px 32px', position: 'relative', minHeight: 180 }}>
        {/* Dark triangle overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 140, height: 140,
          background: 'rgba(20,40,70,0.55)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }} />
        <h1 style={{ color: '#fff', fontSize: 52, fontWeight: 900, margin: 0, letterSpacing: 2, position: 'relative', zIndex: 1 }}>
          {isDevis ? 'DEVIS' : 'FACTURE'}
        </h1>
        <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#d0e8f5', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
            DATE : {formatDate(doc.date)}
          </p>
          {!isDevis && doc.affaire && (
            <p style={{ color: '#d0e8f5', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
              N°AFFAIRE : {doc.affaire}
            </p>
          )}
          {!isDevis && doc.bon && (
            <p style={{ color: '#d0e8f5', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
              N°BON : {doc.bon}
            </p>
          )}
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
            {isDevis ? 'DEVIS' : 'FACTURE'} N° : {doc.number}
          </p>
        </div>
      </div>

      {/* Emetteur / Destinataire */}
      <div style={{ background: '#EAF4FB', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#333', marginBottom: 8 }}>
            ÉMETTEUR :
          </p>
          <p style={{ fontWeight: 800, fontSize: 13, margin: '0 0 3px' }}>{EMETTEUR.name}</p>
          <p style={{ fontSize: 11, margin: '0 0 2px', color: '#444' }}>N° SIRET : {EMETTEUR.siret}</p>
          <p style={{ fontSize: 11, margin: '0 0 2px', color: '#444' }}>{EMETTEUR.email}</p>
          <p style={{ fontSize: 11, margin: 0, color: '#444' }}>{EMETTEUR.phone}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#333', marginBottom: 8 }}>
            DESTINATAIRE :
          </p>
          {doc.client?.name && (
            <p style={{ fontWeight: 800, fontSize: 13, margin: '0 0 3px', textDecoration: 'underline' }}>
              {doc.client.name}
            </p>
          )}
          {doc.client?.address && (
            <p style={{ fontSize: 11, margin: '0 0 2px', color: '#444' }}>{doc.client.address}</p>
          )}
          {doc.client?.city && (
            <p style={{ fontSize: 11, margin: '0 0 2px', color: '#444' }}>{doc.client.city}</p>
          )}
          {doc.client?.phone && (
            <p style={{ fontSize: 11, margin: '0 0 2px', color: '#444' }}>{doc.client.phone}</p>
          )}
          {doc.client?.email && (
            <p style={{ fontSize: 11, margin: 0, color: '#444' }}>{doc.client.email}</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 32px 24px' }}>
        {/* Table header */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr style={{ background: '#3B9FD1' }}>
              <th style={{ color: '#fff', textAlign: 'left', padding: '10px 14px', fontSize: 12, fontWeight: 700, width: '50%' }}>
                Description :
              </th>
              <th style={{ color: '#fff', textAlign: 'center', padding: '10px 14px', fontSize: 12, fontWeight: 700, width: '20%' }}>
                Prix Unitaire :
              </th>
              <th style={{ color: '#fff', textAlign: 'center', padding: '10px 14px', fontSize: 12, fontWeight: 700, width: '15%' }}>
                Quantité :
              </th>
              <th style={{ color: '#fff', textAlign: 'right', padding: '10px 14px', fontSize: 12, fontWeight: 700, width: '15%' }}>
                Total :
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={line.id || i} style={{ background: i % 2 === 1 ? '#F0F7FC' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '11px 14px', fontSize: 12, verticalAlign: 'top' }}>
                  {line.description}
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>
                  {parseFloat(line.unitPrice) > 0 ? `${parseFloat(line.unitPrice).toFixed(2)}€` : '-'}
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>
                  {line.qty}
                </td>
                <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>
                  {parseFloat(line.total) > 0 ? `${parseFloat(line.total).toFixed(2)}€` : '-'}
                </td>
              </tr>
            ))}
            {/* Deplacement row */}
            {(() => {
              const dep = doc.deplacement || { offert: true, price: '' }
              const depOffert = dep.offert !== false
              const depPrice = parseFloat(dep.price || 0)
              return (
                <tr style={{ background: lines.length % 2 === 1 ? '#fff' : '#F0F7FC', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '11px 14px', fontSize: 12 }}>Déplacement</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>
                    {depOffert ? '-' : `${depPrice.toFixed(2)}€`}
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'center' }}>1</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, textAlign: 'right', fontWeight: 700 }}>
                    {depOffert ? 'OFFERT' : `${depPrice.toFixed(2)}€`}
                  </td>
                </tr>
              )
            })()}
            {/* Empty rows for aesthetics */}
            {[...Array(Math.max(0, 4 - lines.length))].map((_, i) => (
              <tr key={`empty-${i}`} style={{ background: (lines.length + 1 + i) % 2 === 1 ? '#fff' : '#F0F7FC', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '11px 14px', height: 36 }}></td>
                <td></td><td></td><td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, paddingRight: 14 }}>
            <span style={{ fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>
              TOTAL :
            </span>
            <span style={{ fontWeight: 900, fontSize: 16 }}>
              {total.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* Payment info (facture only) */}
        {!isDevis && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              RÈGLEMENT :
            </p>
            <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Par virement bancaire :</p>
            <p style={{ fontSize: 11, margin: '0 0 2px', color: '#333' }}>Titulaire du compte : {PAYMENT_INFO.titulaire}</p>
            <p style={{ fontSize: 11, margin: '0 0 2px', color: '#333' }}>Banque : {PAYMENT_INFO.banque}</p>
            <p style={{ fontSize: 11, margin: '0 0 2px', color: '#333' }}>IBAN : {PAYMENT_INFO.iban}</p>
            <p style={{ fontSize: 11, margin: '0 0 16px', color: '#333' }}>BIC : {PAYMENT_INFO.bic}</p>
            <p style={{ fontWeight: 700, fontSize: 11 }}>TVA non applicable, art. 293 B du CGI</p>
          </div>
        )}

        {/* Signature (devis only) */}
        {isDevis && (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontWeight: 700, fontSize: 12 }}>
              Signature suivie de la mention
            </p>
            <p style={{ fontWeight: 700, fontSize: 12 }}>"bon pour accord"</p>
            <div style={{ height: 60 }} />
          </div>
        )}
      </div>

      {/* Footer blue bar */}
      <div style={{ height: 14, background: '#3B9FD1', marginTop: 8 }} />
    </div>
  )
}
