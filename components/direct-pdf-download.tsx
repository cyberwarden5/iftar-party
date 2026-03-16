"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface DirectPdfDownloadProps {
  participants: any[]
  className?: string
}

export default function DirectPdfDownload({ participants, className }: DirectPdfDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleDirectDownload = async () => {
    if (participants.length === 0) {
      toast({
        variant: "destructive",
        title: "No participants",
        description: "There are no participants to include in the PDF.",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Create a simple PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(18)
      doc.text("BATCH-22 IFTAR PARTY - Participants Report", 105, 15, { align: "center" })

      // Add date and venue
      doc.setFontSize(12)
      doc.text("Date: 26/3/25 (25th Ramadan)", 105, 25, { align: "center" })
      doc.text("Venue: Balakhal J.N High School", 105, 35, { align: "center" })

      // Prepare table data
      const tableData = participants.map((p) => [p.name, `${p.amount} taka`, p.payment_method])

      // Add table
      autoTable(doc, {
        head: [["Participant Name", "Amount", "Payment Method"]],
        body: tableData,
        startY: 45,
      })

      // Calculate total
      const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0)

      // Add total
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.text(`Total Amount: ${totalAmount} taka`, 105, finalY, { align: "center" })

      // Save the PDF - using the most direct method
      doc.save("iftar-party-participants.pdf")

      toast({
        title: "PDF Downloaded",
        description: "Your participants report has been downloaded.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
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
    <Button
      onClick={handleDirectDownload}
      disabled={isGenerating || participants.length === 0}
      className={className || "ramadan-button"}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Direct PDF Download
        </>
      )}
    </Button>
  )
}
