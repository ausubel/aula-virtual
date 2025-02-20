"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FileText } from "lucide-react"

// Configurar el worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js"

interface PDFViewerProps {
  file: File | null
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] p-4 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mb-2" />
        <p>Sube tu CV para ver la vista previa</p>
      </div>
    )
  }

  return (
    <div className="h-[600px] overflow-y-auto bg-white">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner className="mb-4" />
            <p className="text-sm text-muted-foreground">Cargando PDF...</p>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2" />
            <p className="font-medium mb-1">No se pudo cargar el PDF</p>
            <p className="text-sm">Por favor, verifica que el archivo sea válido</p>
          </div>
        }
      >
        {numPages &&
          Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="mb-4">
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={400}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                }
              />
            </div>
          ))}
      </Document>
    </div>
  )
}

