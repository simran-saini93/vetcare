// ── CSV Export ────────────────────────────────────────────────────────────────

export function exportCSV(rows, filename = 'report') {
  if (!rows.length) return

  const headers = Object.keys(rows[0])
  const escape  = (val) => {
    const str = String(val ?? '').replace(/"/g, '""')
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
  }

  const csv = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── PDF Export (print window) ─────────────────────────────────────────────────

export function exportPDF({ title, subtitle, columns, rows, filename }) {
  if (!rows.length) return

  const win = window.open('', '_blank')

  const tableRows = rows.map(row =>
    `<tr>${columns.map(col => `<td>${row[col] ?? '—'}</td>`).join('')}</tr>`
  ).join('')

  const tableHeaders = columns.map(col => `<th>${col}</th>`).join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .logo { font-size: 18px; font-weight: 800; color: #4f46e5; }
        .logo span { display: block; font-size: 10px; color: #888; font-weight: 400; margin-top: 2px; }
        .report-title h1 { font-size: 18px; font-weight: 700; text-align: right; }
        .report-title p  { font-size: 11px; color: #666; text-align: right; margin-top: 3px; }
        hr { border: none; border-top: 2px solid #4f46e5; margin: 16px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; font-weight: 700; border-bottom: 2px solid #e5e7eb; }
        td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: top; }
        tr:nth-child(even) td { background: #fafafa; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
        @media print { @page { margin: 1cm; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🐾 VetCare Pro<span>HSCC Veterinary Clinic</span></div>
        <div class="report-title">
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
      </div>
      <hr />
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">
        <span>VetCare Pro · HSCC Veterinary Clinic</span>
        <span>Printed ${new Date().toLocaleString()}</span>
      </div>
      <script>window.onload = () => window.print()</script>
    </body>
    </html>
  `)
  win.document.close()
}
