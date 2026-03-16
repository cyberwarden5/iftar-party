import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { saveAs } from "file-saver"

// Define the participant interface
interface Participant {
  name: string
  amount: number
  payment_method: string
  date: string
  transaction_id?: string
}

/**
 * Generates an enhanced Ramadan-themed PDF report of participants for the Iftar Party
 * with improved error handling and download functionality
 * @param participants Array of participant data
 * @returns Promise that resolves to a boolean indicating success
 */
export async function generateImprovedPDF(participants: Participant[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting improved PDF generation with", participants.length, "participants")

      // Create a new PDF document with better font support
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
        compress: true,
      })

      // Set document properties
      doc.setProperties({
        title: "BATCH-22 IFTAR PARTY - Participants Report",
        subject: "Iftar Party Participants",
        author: "Iftar Party Organizer",
        creator: "Iftar Party Organizer",
        keywords: "iftar, ramadan, participants",
      })

      // Add Ramadan-themed header with enhanced design
      // Header background with gradient effect
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Create gradient background
      const grd = doc.context2d.createLinearGradient(0, 0, pageWidth, 0)
      grd.addColorStop(0, "#0f2e68")
      grd.addColorStop(1, "#1e3a8a")
      doc.context2d.fillStyle = grd
      doc.context2d.fillRect(0, 0, pageWidth, 50)

      // Draw multiple crescent moons and stars for enhanced Ramadan theme
      doc.setDrawColor(255, 255, 255)
      doc.setFillColor(255, 255, 255)

      // Main crescent moon
      doc.circle(20, 20, 10, "F") // Outer circle
      doc.setFillColor(25, 55, 102) // Background color
      doc.circle(25, 20, 9, "F") // Inner circle to create crescent

      // Secondary crescent moon
      doc.setFillColor(255, 255, 255)
      doc.circle(180, 15, 6, "F") // Outer circle
      doc.setFillColor(25, 55, 102) // Background color
      doc.circle(183, 15, 5, "F") // Inner circle to create crescent

      // Draw stars function with enhanced design
      function drawStar(x: number, y: number, size: number) {
        doc.setFillColor(255, 255, 255)
        const points = []
        for (let i = 0; i < 5; i++) {
          points.push([
            x + size * Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2),
            y + size * Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2),
          ])
          points.push([
            x + (size / 2) * Math.cos(((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2),
            y + (size / 2) * Math.sin(((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2),
          ])
        }
        doc.polygon(
          points.map((p) => p[0]),
          points.map((p) => p[1]),
          "F",
        )
      }

      // Add multiple stars for enhanced Ramadan theme
      drawStar(35, 15, 3)
      drawStar(45, 25, 2)
      drawStar(160, 15, 3)
      drawStar(170, 25, 2)
      drawStar(190, 25, 2)
      drawStar(150, 35, 1.5)
      drawStar(200, 15, 1.5)

      // Add decorative Islamic pattern
      doc.setDrawColor(255, 255, 255, 0.3)
      doc.setLineWidth(0.2)
      for (let i = 0; i < pageWidth; i += 10) {
        doc.line(i, 0, i, 50)
      }
      for (let i = 0; i < 50; i += 10) {
        doc.line(0, i, pageWidth, i)
      }

      // Add title with enhanced styling
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(26)
      doc.setFont("helvetica", "bold")
      doc.text("BATCH-22 IFTAR PARTY", pageWidth / 2, 20, { align: "center" })

      // Add date and venue with prefixes as requested
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Date: 26/3/25 (25th Ramadan)", pageWidth / 2, 32, { align: "center" })
      doc.text("Venue: Balakhal J.N High School", pageWidth / 2, 42, { align: "center" })

      // Add subtitle with enhanced styling
      doc.setTextColor(25, 55, 102)
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text("Participants Report", pageWidth / 2, 65, { align: "center" })

      // Add decorative line under subtitle
      doc.setDrawColor(25, 55, 102)
      doc.setLineWidth(0.5)
      doc.line(70, 68, 140, 68)

      // Add generation date
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 75, { align: "center" })

      // Calculate total amount
      const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0)

      // Prepare table data - removing transaction ID column as requested
      const tableData = participants.map((p) => [p.name, `${p.amount} taka`, p.payment_method])

      // Add table with enhanced styling
      autoTable(doc, {
        head: [["Participant Name", "Amount", "Payment Method"]],
        body: tableData,
        startY: 80,
        headStyles: {
          fillColor: [25, 55, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 245, 255],
        },
        bodyStyles: {
          textColor: [50, 50, 50],
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          overflow: "linebreak",
          halign: "left",
        },
        // Ensure all content fits on one page with adjusted margins
        margin: { top: 80, right: 14, bottom: 60, left: 14 },
        didDrawPage: (data) => {
          // Add footer on each page
          const pageHeight = doc.internal.pageSize.getHeight()

          // Add footer background
          doc.setFillColor(25, 55, 102)
          doc.rect(0, pageHeight - 20, pageWidth, 20, "F")

          // Add footer text
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(10)
          doc.setFont("helvetica", "normal")
          doc.text("© Iftar Party Organizer - Ramadan 2025", pageWidth / 2, pageHeight - 10, { align: "center" })
        },
      })

      // Add total at the bottom
      const finalY = (doc as any).lastAutoTable.finalY + 10

      // Add separator line
      doc.setDrawColor(25, 55, 102)
      doc.setLineWidth(0.5)
      doc.line(14, finalY - 5, 196, finalY - 5)

      // Add total text
      doc.setFontSize(12)
      doc.setTextColor(25, 55, 102)
      doc.setFont("helvetica", "bold")
      doc.text("Total Amount Collected:", 14, finalY)

      // Add total amount
      doc.setFontSize(14)
      doc.text(`${totalAmount} taka`, 196, finalY, { align: "right" })

      // Add thank you message as requested
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(80, 80, 80)
      doc.text(
        "Thank you to all participants for your contributions. Everyone is cordially invited to join us for this blessed occasion.",
        pageWidth / 2,
        finalY + 10,
        { align: "center" },
      )
      doc.text(
        "May Allah accept our prayers and fasting during this holy month of Ramadan.",
        pageWidth / 2,
        finalY + 15,
        {
          align: "center",
        },
      )

      // Get the PDF as a blob
      const pdfBlob = doc.output("blob")

      // Use FileSaver.js to save the file (more reliable cross-browser)
      saveAs(pdfBlob, "batch-22-iftar-party-participants.pdf")

      console.log("PDF saved successfully")
      resolve(true)
    } catch (error) {
      console.error("Error generating PDF:", error)
      reject(error)
    }
  })
}

/**
 * Alternative method to generate and download PDF using data URLs
 * This serves as a fallback method if the primary method fails
 */
export async function generatePDFWithDataURL(participants: Participant[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting alternative PDF generation with", participants.length, "participants")

      // Create a new PDF document
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: "BATCH-22 IFTAR PARTY - Participants Report",
        subject: "Iftar Party Participants",
        author: "Iftar Party Organizer",
        creator: "Iftar Party Organizer",
      })

      // Add a simple header
      doc.setFillColor(25, 55, 102)
      doc.rect(0, 0, 210, 40, "F")

      // Add title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text("BATCH-22 IFTAR PARTY", 105, 20, { align: "center" })

      // Add date and venue
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Date: 26/3/25 (25th Ramadan)", 105, 30, { align: "center" })
      doc.text("Venue: Balakhal J.N High School", 105, 38, { align: "center" })

      // Add subtitle
      doc.setTextColor(25, 55, 102)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Participants Report", 105, 55, { align: "center" })

      // Prepare table data
      const tableData = participants.map((p) => [p.name, `${p.amount} taka`, p.payment_method])

      // Add table
      autoTable(doc, {
        head: [["Participant Name", "Amount", "Payment Method"]],
        body: tableData,
        startY: 65,
      })

      // Calculate total amount
      const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0)

      // Add total
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.setTextColor(25, 55, 102)
      doc.setFont("helvetica", "bold")
      doc.text(`Total Amount Collected: ${totalAmount} taka`, 105, finalY, { align: "center" })

      // Generate data URL
      const pdfDataUrl = doc.output("dataurlstring")

      // Create a download link and trigger it
      const downloadLink = document.createElement("a")
      downloadLink.href = pdfDataUrl
      downloadLink.download = "batch-22-iftar-party-participants.pdf"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      console.log("PDF saved successfully via data URL")
      resolve(true)
    } catch (error) {
      console.error("Error generating PDF with data URL:", error)
      reject(error)
    }
  })
}

/**
 * Fallback method using Blob URLs
 * This serves as a second fallback method
 */
export async function generatePDFWithBlobURL(participants: Participant[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting blob URL PDF generation with", participants.length, "participants")

      // Create a new PDF document
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: "BATCH-22 IFTAR PARTY - Participants Report",
        subject: "Iftar Party Participants",
        author: "Iftar Party Organizer",
        creator: "Iftar Party Organizer",
      })

      // Add a simple header
      doc.setFillColor(25, 55, 102)
      doc.rect(0, 0, 210, 40, "F")

      // Add title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.text("BATCH-22 IFTAR PARTY", 105, 20, { align: "center" })

      // Add date and venue
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("Date: 26/3/25 (25th Ramadan)", 105, 30, { align: "center" })
      doc.text("Venue: Balakhal J.N High School", 105, 38, { align: "center" })

      // Add subtitle
      doc.setTextColor(25, 55, 102)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Participants Report", 105, 55, { align: "center" })

      // Prepare table data
      const tableData = participants.map((p) => [p.name, `${p.amount} taka`, p.payment_method])

      // Add table
      autoTable(doc, {
        head: [["Participant Name", "Amount", "Payment Method"]],
        body: tableData,
        startY: 65,
      })

      // Calculate total amount
      const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0)

      // Add total
      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.setTextColor(25, 55, 102)
      doc.setFont("helvetica", "bold")
      doc.text(`Total Amount Collected: ${totalAmount} taka`, 105, finalY, { align: "center" })

      // Generate blob
      const pdfBlob = doc.output("blob")

      // Create a blob URL
      const blobUrl = URL.createObjectURL(pdfBlob)

      // Create a download link and trigger it
      const downloadLink = document.createElement("a")
      downloadLink.href = blobUrl
      downloadLink.download = "batch-22-iftar-party-participants.pdf"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 100)

      console.log("PDF saved successfully via blob URL")
      resolve(true)
    } catch (error) {
      console.error("Error generating PDF with blob URL:", error)
      reject(error)
    }
  })
}
