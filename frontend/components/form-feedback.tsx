"use client"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface FeedbackProps {
  status: "success" | "error" | "warning"
  message: string
}

export function FormFeedback({ status, message }: FeedbackProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  }

  const colors = {
    success: "text-green-600 bg-green-50",
    error: "text-red-600 bg-red-50",
    warning: "text-yellow-600 bg-yellow-50",
  }

  const Icon = icons[status]

  return (
    <div className={`flex items-center gap-2 p-3 rounded-md ${colors[status]}`} role="alert">
      <Icon className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

