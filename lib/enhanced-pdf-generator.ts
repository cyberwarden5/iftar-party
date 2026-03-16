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
 * Generates an enhanced Ramadan-themed PDF report of participants for the Iftar Party
 * @param participants Array of participant data
 * @returns boolean indicating success
 */
export function generateEnhancedParticipantsPDF(participants: Participant[]): boolean {
  try {
    console.log("Starting enhanced PDF generation with", participants.length, "participants")

    // Create a new PDF document
    const doc = new jsPDF()

    // Set document properties
    doc.setProperties({
      title: "BATCH-22 IFTAR PARTY - Participants Report",
      subject: "Iftar Party Participants",
      author: "Iftar Party Organizer",
      creator: "Iftar Party Organizer",
    })

    // Add Ramadan-themed header with enhanced design
    // Header background with gradient effect
    const grd = doc.context2d.createLinearGradient(0, 0, 210, 0)
    grd.addColorStop(0, "#0f2e68")
    grd.addColorStop(1, "#1e3a8a")
    doc.context2d.fillStyle = grd
    doc.context2d.fillRect(0, 0, 210, 50)

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
    for (let i = 0; i < 210; i += 10) {
      doc.line(i, 0, i, 50)
    }
    for (let i = 0; i < 50; i += 10) {
      doc.line(0, i, 210, i)
    }

    // Add title with enhanced styling
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(26)
    doc.setFont("helvetica", "bold")
    doc.text("BATCH-22 IFTAR PARTY", 105, 20, { align: "center" })

    // Add date and venue with prefixes as requested
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Date: 26/3/25 (25th Ramadan)", 105, 32, { align: "center" })
    doc.text("Venue: Balakhal J.N High School", 105, 42, { align: "center" })

    // Add subtitle with enhanced styling
    doc.setTextColor(25, 55, 102)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("Participants Report", 105, 65, { align: "center" })

    // Add decorative line under subtitle
    doc.setDrawColor(25, 55, 102)
    doc.setLineWidth(0.5)
    doc.line(70, 68, 140, 68)

    // Add generation date
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 75, { align: "center" })

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
        const pageHeight = doc.internal.pageSize.height

        // Add footer background
        doc.setFillColor(25, 55, 102)
        doc.rect(0, pageHeight - 20, 210, 20, "F")

        // Add footer text
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("© Iftar Party Organizer - Ramadan 2025", 105, pageHeight - 10, { align: "center" })
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
      105,
      finalY + 10,
      { align: "center" },
    )
    doc.text("May Allah accept our prayers and fasting during this holy month of Ramadan.", 105, finalY + 15, {
      align: "center",
    })

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
