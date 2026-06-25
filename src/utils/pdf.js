import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

async function captureElement(elementId) {
  const el = document.getElementById(elementId)
  if (!el) throw new Error(`Element #${elementId} not found`)

  // Scroll the element into view so html2canvas captures it fully
  el.scrollIntoView({ block: 'start', behavior: 'instant' })

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    // Compensate for any page scroll so we get the real element position
    scrollX: 0,
    scrollY: 0,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    x: 0,
    y: 0,
    width: el.scrollWidth,
    height: el.scrollHeight,
  })
  return canvas
}

function canvasToPDF(canvas) {
  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfW    = pdf.internal.pageSize.getWidth()
  const pdfH    = (canvas.height * pdfW) / canvas.width
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
  return pdf
}

export async function exportDocumentToPDF(elementId, filename) {
  const canvas = await captureElement(elementId)
  const pdf    = canvasToPDF(canvas)
  pdf.save(filename)
}

export async function shareDocument(elementId, filename) {
  const canvas = await captureElement(elementId)
  const pdf    = canvasToPDF(canvas)

  // Try native share sheet (works on iOS/Android Safari)
  if (typeof navigator.canShare === 'function') {
    const blob = pdf.output('blob')
    const file = new File([blob], filename, { type: 'application/pdf' })
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
      return
    }
  }

  // Desktop / unsupported browser: direct download
  pdf.save(filename)
}
