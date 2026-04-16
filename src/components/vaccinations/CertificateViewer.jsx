'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Printer, Download } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function CertificateViewer({ url, onClose }) {
  const [numPages, setNumPages]     = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale]           = useState(1.2)

  const isPdf = url?.toLowerCase().includes('.pdf') || !url?.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)

  const handlePrint = () => {
    if (isPdf) {
      const win = window.open(url, '_blank')
      win?.addEventListener('load', () => win.print())
    } else {
      const win = window.open('', '_blank')
      win.document.write(`<html><body style="margin:0"><img src="${url}" style="max-width:100%"/></body></html>`)
      win.document.close()
      win.addEventListener('load', () => win.print())
    }
  }

  const handleDownload = async () => {
    try {
      const res  = await fetch(url)
      const blob = await res.blob()
      const a    = document.createElement('a')
      a.href     = URL.createObjectURL(blob)
      a.download = isPdf ? 'certificate.pdf' : 'certificate.jpg'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Vaccination Certificate</p>
          <div className="flex items-center gap-1">
            {/* Zoom controls — PDF only */}
            {isPdf && (
              <>
                <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Zoom out">
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs text-gray-400 w-10 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Zoom in">
                  <ZoomIn size={16} />
                </button>
                <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />
              </>
            )}

            {/* Print */}
            <button onClick={handlePrint}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Print">
              <Printer size={16} />
            </button>

            {/* Download */}
            <button onClick={handleDownload}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Download">
              <Download size={16} />
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

            {/* Close */}
            <button onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-gray-50 dark:bg-zinc-950">
          {isPdf ? (
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              }
              error={
                <div className="text-center py-10">
                  <p className="text-red-500 text-sm mb-3">Failed to load PDF</p>
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                    Open directly in browser
                  </a>
                </div>
              }
            >
              <Page pageNumber={pageNumber} scale={scale} className="shadow-lg" renderTextLayer renderAnnotationLayer />
            </Document>
          ) : (
            <img src={url} alt="Certificate" className="max-w-full rounded-lg shadow-lg" />
          )}
        </div>

        {/* Pagination */}
        {isPdf && numPages && numPages > 1 && (
          <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0">
            <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600 dark:text-zinc-300">Page {pageNumber} of {numPages}</span>
            <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
