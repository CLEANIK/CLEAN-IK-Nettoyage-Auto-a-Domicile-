import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportDocumentToPDF(elementId, filename) {
  const el = document.getElementById(elementId)
  if (!el) return

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = (canvas.height * pdfW) / canvas.width

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
  pdf.save(filename)
}

export async function shareDocument(elementId, filename) {
  const el = document.getElementById(elementId)
  if (!el) return

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.92)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = (canvas.height * pdfW) / canvas.width
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)

  const blob = pdf.output('blob')
  const file = new File([blob], filename, { type: 'application/pdf' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: filename })
  } else {
    pdf.save(filename)
  }
}
