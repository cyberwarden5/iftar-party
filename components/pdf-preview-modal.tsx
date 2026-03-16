"use client"

import { useState } from "react"
import { FileDown, Loader2, X } from "lucide-react"
import { generateEnhancedParticipantsPDF } from "@/lib/enhanced-pdf-generator"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PdfPreviewModalProps {
  participants: any[]
  isOpen: boolean
  onClose: () => void
}

export default function PdfPreviewModal({ participants, isOpen, onClose }: PdfPreviewModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const handleGeneratePDF = () => {
    setIsGenerating(true)

    setTimeout(() => {
      try {
        // Format participants data for PDF
        const formattedParticipants = participants.map((p) => ({
          name: p.name,
          amount: p.amount,
          payment_method: p.payment_method,
          date: p.date,
          transaction_id: p.transaction_id,
        }))

        // Use the enhanced PDF generator
        const result = generateEnhancedParticipantsPDF(formattedParticipants)

        if (result) {
          toast({
            title: "Ramadan-Themed PDF Generated",
            description: "Your beautiful participants report has been downloaded.",
          })
          onClose()
        } else {
          throw new Error("PDF generation failed")
        }
      } catch (error) {
        console.error("PDF generation error:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
        })
      } finally {
        setIsGenerating(false)
      }
    }, 100)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-800/30 rounded-lg shadow-xl p-6 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-blue-300 hover:text-blue-100 hover:bg-blue-950/50"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 relative">
              <div className="w-12 h-12 bg-blue-600 rounded-full absolute left-0 top-2"></div>
              <div className="w-10 h-10 bg-slate-900 rounded-full absolute left-4 top-2"></div>
              <div className="absolute right-0 top-0 w-6 h-6">
                {/* Star shape */}
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-300">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Ramadan-Themed PDF Preview
          </h2>
          <p className="text-blue-300 mt-2">Generate a beautiful Ramadan-themed PDF with all participant information</p>
        </div>

        <div className="bg-slate-900/50 border border-blue-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">PDF Contents</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Beautiful Ramadan-themed header with crescent moon and stars</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Title: BATCH-22 IFTAR PARTY</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Date: 26/3/25 (25th Ramadan)</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Venue: Balakhal J.N High School</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Complete list of {participants.length} participants with names, amounts, and payment methods</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Total amount collected: {participants.reduce((sum, p) => sum + p.amount, 0)} taka</span>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span>Thank you message and Ramadan blessings</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleGeneratePDF} disabled={isGenerating} className="ramadan-button" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-5 w-5" />
                Generate Ramadan-Themed PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
