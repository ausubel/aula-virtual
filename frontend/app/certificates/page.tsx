'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AwardIcon, DownloadIcon, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import withCVRequired from "@/components/auth/with-cv-required"

// Datos simulados de certificados
const mockCertificates = [
  {
    id: 1,
    name: "Matemáticas Avanzadas",
    hours: 40,
    date_emission: new Date(2023, 11, 15),
    file: "/certificates/math-certificate.pdf"
  },
  {
    id: 2,
    name: "Programación Web",
    hours: 60,
    date_emission: new Date(2023, 10, 20),
    file: "/certificates/web-certificate.pdf"
  },
  {
    id: 3,
    name: "Inglés Técnico",
    hours: 30,
    date_emission: new Date(2023, 9, 5),
    file: "/certificates/english-certificate.pdf"
  }
]

export default function CertificatesPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Certificados</h1>
      <p className="text-lg">
        Por favor, utiliza un enlace específico para ver un certificado.
      </p>
    </div>
  )
}