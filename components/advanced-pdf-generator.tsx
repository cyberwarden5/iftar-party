"use client"

import { useState, useEffect } from "react"
import { FileDown, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react"
import { generateImprovedPDF, generatePDFWithDataURL, generatePDFWithBlobURL } from "@/lib/improved-pdf-generator"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AdvancedPdfGeneratorProps {
  participants: any[]
  isOpen: boolean
  onClose: () => void
}

export default function AdvancedPdfGenerator({ participants, isOpen, onClose }: AdvancedPdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Reset states when modal opens
    if (isOpen) {
      setIsGenerating(false)
      setProgress(0)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  // Simulate progress updates
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isGenerating && progress < 90) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.floor(Math.random() * 10) + 1
          return Math.min(prev + increment, 90)
        })
      }, 300)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating, progress])

  if (!isOpen) return null

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Format participants data for PDF
      const formattedParticipants = participants.map((p) => ({
        name: p.name,
        amount: p.amount,
        payment_method: p.payment_method,
        date: p.date,
        transaction_id: p.transaction_id,
      }))

      // Try the primary method first
      try {
        await generateImprovedPDF(formattedParticipants)
        setProgress(100)
        setSuccess(true)

        toast({
          title: "PDF Generated Successfully",
          description: "Your Ramadan-themed participants report has been downloaded.",
        })

        // Close the modal after a short delay
        setTimeout(() => {
          onClose()
        }, 1500)

        return
      } catch (primaryError) {
        console.error("Primary PDF generation method failed:", primaryError)

        // Try the first fallback method
        try {
          await generatePDFWithDataURL(formattedParticipants)
          setProgress(100)
          setSuccess(true)

          toast({
            title: "PDF Generated Successfully",
            description: "Your Ramadan-themed participants report has been downloaded using alternative method.",
          })

          // Close the modal after a short delay
          setTimeout(() => {
            onClose()
          }, 1500)

          return
        } catch (fallbackError) {
          console.error("First fallback PDF generation method failed:", fallbackError)

          // Try the second fallback method
          await generatePDFWithBlobURL(formattedParticipants)
          setProgress(100)
          setSuccess(true)

          toast({
            title: "PDF Generated Successfully",
            description: "Your Ramadan-themed participants report has been downloaded using second alternative method.",
          })

          // Close the modal after a short delay
          setTimeout(() => {
            onClose()
          }, 1500)
        }
      }
    } catch (error) {
      console.error("All PDF generation methods failed:", error)
      setError("Failed to generate PDF. Please try again or contact support.")
      setProgress(0)

      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "We couldn't generate your PDF. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border border-blue-800/30 rounded-lg shadow-xl p-6 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-blue-300 hover:text-blue-100 hover:bg-blue-950/50"
          onClick={onClose}
          disabled={isGenerating}
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
            Ramadan-Themed PDF Generator
          </h2>
          <p className="text-blue-300 mt-2">Generate a beautiful Ramadan-themed PDF with all participant information</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-800/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-800/30">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>PDF generated successfully! Your download should begin automatically.</AlertDescription>
          </Alert>
        )}

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

        {isGenerating && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Generating PDF...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-blue-950" indicatorClassName="bg-blue-500" />
          </div>
        )}

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
