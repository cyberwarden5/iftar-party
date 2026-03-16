import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Define the participant interface
interface Participant {
  name: string
  amount: number
  payment_method: string
  date: string
  transaction_id?: string
}

/**
 * Generates a PDF report of participants for the Iftar Party
 * @param participants Array of participant data
 * @returns boolean indicating success
 */
export function generateParticipantsPDF(participants: Participant[]): boolean {
  try {
    console.log("Starting PDF generation with", participants.length, "participants")

    // Create a new PDF document
    const doc = new jsPDF()

    // Set document properties
    doc.setProperties({
      title: "BATCH-22 IFTAR PARTY - Participants Report",
      subject: "Iftar Party Participants",
      author: "Iftar Party Organizer",
      creator: "Iftar Party Organizer",
    })

    // Add Ramadan-themed header
    // Header background
    doc.setFillColor(25, 55, 102) // Dark blue
    doc.rect(0, 0, 210, 40, "F")

    // Draw crescent moon
    doc.setDrawColor(255, 255, 255)
    doc.setFillColor(255, 255, 255)
    doc.circle(20, 20, 8, "F") // Outer circle
    doc.setFillColor(25, 55, 102) // Background color
    doc.circle(24, 20, 7, "F") // Inner circle to create crescent

    // Draw stars
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

    // Add stars
    drawStar(35, 15, 3)
    drawStar(180, 15, 3)
    drawStar(170, 25, 2)
    drawStar(190, 25, 2)

    // Add title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("BATCH-22 IFTAR PARTY", 105, 15, { align: "center" })

    // Add date and venue
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Date: 26/3/25 (25th Ramadan)", 105, 25, { align: "center" })
    doc.text("Venue: Balakhal J.N High School", 105, 32, { align: "center" })

    // Add subtitle
    doc.setTextColor(25, 55, 102)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Participants Report", 105, 50, { align: "center" })

    // Add generation date
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 58, { align: "center" })

    // Calculate total amount
    const totalAmount = participants.reduce((sum, p) => sum + p.amount, 0)

    // Prepare table data
    const tableData = participants.map((p) => [p.name, `${p.amount} taka`, p.payment_method])

    // Add table
    autoTable(doc, {
      head: [["Participant Name", "Amount", "Payment Method"]],
      body: tableData,
      startY: 65,
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
      },
      // Ensure all content fits on one page
      margin: { top: 65, right: 14, bottom: 40, left: 14 },
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

    // Add thank you message
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(80, 80, 80)
    doc.text(
      "Thank you to all participants for your contributions. Everyone is cordially invited to join us for this blessed occasion.",
      105,
      finalY + 10,
      { align: "center" },
    )

    // Add footer
    doc.setFillColor(25, 55, 102)
    doc.rect(0, 280, 210, 17, "F")

    // Add footer text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("© Iftar Party Organizer - Ramadan 2025", 105, 290, { align: "center" })

    // Save the PDF
    console.log("Saving PDF...")
    doc.save("batch-22-iftar-party-participants.pdf")
    console.log("PDF saved successfully")

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}
