import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CLASS_INFO = {
  K1:'Siput', K2:'Open', K3:'Open', K4:'Open', K5:'Open',
  K6:'Girls Only', K7:'Rockie', K8:'¾ Wheel', K9:'Rockie',
  K10:'Rockie', K11:'Rockie', K12:'Mix', K13:'Mix',
  K14:'Girls Only', K15:'Girls Only', K16:'Girls Only',
  K17:'Open', K18:'Open', K19:'Girls Only', K20:'FFA'
}

export function exportRiderListPDF(registrations) {
  const doc = new jsPDF()
  const allChildren = registrations.flatMap(r =>
    (r.children || []).map(c => ({ ...c, parent: r.parent_name, phone: r.phone }))
  )

  // Group by class
  const byClass = {}
  allChildren.forEach(child => {
    child.classes?.forEach(cls => {
      if (!byClass[cls]) byClass[cls] = []
      byClass[cls].push(child)
    })
  })

  const sortedClasses = Object.keys(byClass)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  let pageCount = 0

  sortedClasses.forEach(cls => {
    if (pageCount > 0) doc.addPage()
    pageCount++

    // Header
    doc.setFillColor(30, 30, 40)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(250, 200, 0)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PUSHBIKE KUPANG-NTT', 105, 15, { align: 'center' })
    doc.setFontSize(12)
    doc.setTextColor(200, 200, 200)
    doc.text('Racing Championship 2025 — Rider List', 105, 25, { align: 'center' })

    // Class title
    doc.setTextColor(30, 30, 40)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${cls} — ${CLASS_INFO[cls]}`, 14, 52)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Total Riders: ${byClass[cls].length}`, 14, 60)

    // Table
    autoTable(doc, {
      startY: 65,
      head: [['#', 'Rider Name', 'Gender', 'Date of Birth', 'Parent', 'Phone']],
      body: byClass[cls].map((child, i) => [
        i + 1,
        child.child_name,
        child.gender,
        new Date(child.date_of_birth).toLocaleDateString('id-ID'),
        child.parent,
        child.phone
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [250, 200, 0], textColor: [30, 30, 40], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: { 0: { cellWidth: 10 } }
    })
  })

  doc.save('Pushbike-NTT-Rider-List.pdf')
}

export function exportHeatDrawPDF(heats, className) {
  const doc = new jsPDF()

  const classHeats = className === 'all' ? heats : heats.filter(h => h.class_id === className)
  const classes = [...new Set(classHeats.map(h => h.class_id))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  let pageCount = 0

  classes.forEach(cls => {
    if (pageCount > 0) doc.addPage()
    pageCount++

    // Header
    doc.setFillColor(30, 30, 40)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(250, 200, 0)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PUSHBIKE KUPANG-NTT', 105, 15, { align: 'center' })
    doc.setFontSize(12)
    doc.setTextColor(200, 200, 200)
    doc.text('Racing Championship 2025 — Heat Draw', 105, 25, { align: 'center' })

    // Class title
    doc.setTextColor(30, 30, 40)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${cls} — ${CLASS_INFO[cls]} — Heat Draw`, 14, 52)

    const clsHeats = classHeats.filter(h => h.class_id === cls)
    const heatNumbers = [...new Set(clsHeats.map(h => h.heat_number))].sort((a,b) => a-b)

    let currentY = 62

    heatNumbers.forEach(heatNum => {
      const riders = clsHeats
        .filter(h => h.heat_number === heatNum)
        .sort((a, b) => a.lane - b.lane)

      autoTable(doc, {
        startY: currentY,
        head: [[`Heat ${heatNum}`, 'Rider Name']],
        body: riders.map((r, i) => [i + 1, r.rider_name]),
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [250, 200, 0], textColor: [30, 30, 40], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        columnStyles: { 0: { cellWidth: 20 } },
        margin: { left: 14, right: 14 },
        tableWidth: 180
      })

      currentY = doc.lastAutoTable.finalY + 8
    })
  })

  const filename = className === 'all'
    ? 'Pushbike-NTT-Heat-Draw-All.pdf'
    : `Pushbike-NTT-Heat-Draw-${className}.pdf`
  doc.save(filename)
}