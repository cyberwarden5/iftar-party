"use client"

import { useEffect, useState } from "react"
import { Edit, Filter, Plus, Search, Trash, ChevronDown, FileDown, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AddParticipantForm from "@/components/add-participant-form"
import { JsonDatabase } from "@/lib/json-db"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import AdvancedPdfGenerator from "@/components/advanced-pdf-generator"
import DirectPdfDownload from "@/components/direct-pdf-download"

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<any>(null)
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  // Replace the state for PDF modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  // Function to fetch participants data
  const fetchParticipants = async () => {
    try {
      setIsLoading(true)
      JsonDatabase.initialize()
      const data = JsonDatabase.getParticipants()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setParticipants(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load participants. Please try again.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    fetchParticipants()

    // Listen for database changes
    const handleDatabaseChange = () => {
      fetchParticipants()
    }

    window.addEventListener("databaseChange", handleDatabaseChange)
    return () => window.removeEventListener("databaseChange", handleDatabaseChange)
  }, [])

  const handleDelete = async () => {
    if (!participantToDelete) return

    try {
      console.log("[v0] Deleting participant:", participantToDelete)

      const success = JsonDatabase.deleteParticipant(participantToDelete)
      
      if (!success) {
        throw new Error("Failed to delete participant")
      }

      console.log("[v0] Participant deleted successfully")

      toast({
        title: "Success ✨",
        description: "Participant deleted successfully",
      })

      // Refresh data
      fetchParticipants()
    } catch (error) {
      console.error("Failed to delete participant:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete participant. Please try again.",
      })
    } finally {
      setParticipantToDelete(null)
    }
  }

  // Filter participants based on search term and payment filter
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (participant.transaction_id && participant.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "cash" && participant.payment_method === "Cash") ||
      (paymentFilter === "bkash" && participant.payment_method === "bKash") ||
      (paymentFilter === "paid" && participant.amount >= 400) ||
      (paymentFilter === "unpaid" && participant.amount < 400)

    return matchesSearch && matchesPayment
  })

  // Calculate total amount collected
  const totalCollected = participants.reduce((sum, p) => sum + p.amount, 0)

  // Calculate average contribution
  const averageContribution = participants.length > 0 ? totalCollected / participants.length : 0

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Participants Management</h1>
          <p className="text-blue-300">Manage {participants.length} participants and their contributions</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            onClick={() => {
              setIsRefreshing(true)
              fetchParticipants()
            }}
            variant="outline"
            size="icon"
            className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button
            onClick={() => {
              setEditingParticipant(null)
              setShowAddForm(true)
            }}
            className="w-full md:w-auto ramadan-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </div>
      </div>

      {(showAddForm || editingParticipant) && (
        <Card className="mb-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border-blue-800/30 text-white ramadan-card">
          <CardHeader>
            <CardTitle>{editingParticipant ? "Edit Participant" : "Add New Participant"}</CardTitle>
            <CardDescription className="text-slate-400">
              {editingParticipant ? "Update participant details" : "Enter the participant's details below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddParticipantForm
              participant={editingParticipant}
              onSuccess={() => {
                setShowAddForm(false)
                setEditingParticipant(null)
                // Refresh data
                fetchParticipants()
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search by name or transaction ID..."
            className="pl-8 bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-full md:w-64">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="bg-slate-900/50 border-blue-800/30 text-white">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-400" />
                  <SelectValue placeholder="Filter participants" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-blue-800/30 text-white">
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="cash">Cash Payments</SelectItem>
                <SelectItem value="bkash">bKash Payments</SelectItem>
                <SelectItem value="paid">Paid Minimum (≥400)</SelectItem>
                <SelectItem value="unpaid">Below Minimum (&lt;400)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ramadan-button" disabled={participants.length === 0}>
                <FileDown className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-blue-800/30">
              <DropdownMenuLabel className="text-blue-300">PDF Options</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-blue-800/30" />
              <DropdownMenuItem
                onClick={() => setIsPdfModalOpen(true)}
                className="text-blue-300 focus:text-blue-100 cursor-pointer"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Advanced PDF Generator
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DirectPdfDownload
                  participants={participants}
                  className="w-full justify-start text-blue-300 focus:text-blue-100 cursor-pointer"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border-blue-800/30 text-white ramadan-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Participants List</CardTitle>
              <CardDescription className="text-slate-400">
                Showing {filteredParticipants.length} of {participants.length} participants
              </CardDescription>
            </div>
            <div className="mt-2 md:mt-0 flex flex-col items-end">
              <div className="text-sm text-blue-300">
                <span className="font-medium">Average Contribution:</span>{" "}
                <span className="text-white">৳{Math.round(averageContribution).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700/30 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-800/30 hover:bg-transparent">
                    <TableHead className="text-blue-300">Name</TableHead>
                    <TableHead className="text-blue-300">Date</TableHead>
                    <TableHead className="text-blue-300">Amount</TableHead>
                    <TableHead className="text-blue-300">Payment Method</TableHead>
                    <TableHead className="text-blue-300">Transaction ID</TableHead>
                    <TableHead className="text-blue-300">Status</TableHead>
                    <TableHead className="text-blue-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow className="border-blue-800/30 hover:bg-blue-950/20">
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                        {searchTerm || paymentFilter !== "all"
                          ? "No participants match your search or filter"
                          : "No participants added yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant) => (
                      <TableRow
                        key={participant.id}
                        className={`border-blue-800/30 hover:bg-blue-950/20 transition-all duration-300 ${
                          participant.amount >= 400 ? "bg-green-900/10" : ""
                        }`}
                      >
                        <TableCell className="font-medium text-white">{participant.name}</TableCell>
                        <TableCell className="text-slate-300">{new Date(participant.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-green-400 font-semibold">৳{participant.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              participant.paymentMethod === "Cash"
                                ? "border-green-500 text-green-400 bg-green-900/10"
                                : "border-blue-500 text-blue-400 bg-blue-900/10"
                            }
                          >
                            {participant.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {participant.paymentMethod === "bKash" ? (participant.transactionId || "-") : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              participant.amount >= 400
                                ? "bg-green-500/20 text-green-400 border border-green-400/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                            }
                          >
                            {participant.amount >= 400 ? "✓ Paid Minimum" : "⚠ Below Minimum"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                              >
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] bg-slate-900 border-blue-800/30">
                              <DropdownMenuLabel className="text-blue-300">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-blue-800/30" />
                              <DropdownMenuItem
                                onClick={() => setEditingParticipant(participant)}
                                className="text-blue-300 focus:text-blue-100 cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-blue-800/30" />
                              <DropdownMenuItem
                                onClick={() => setParticipantToDelete(participant.id)}
                                className="text-red-400 focus:text-red-300 cursor-pointer"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <tfoot className="border-t border-blue-800/30">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-right font-semibold text-blue-300">
                      Total Collected:
                    </td>
                    <td className="py-3 px-4 font-bold text-white">৳{totalCollected.toLocaleString()}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!participantToDelete} onOpenChange={() => setParticipantToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-blue-800/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the participant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdvancedPdfGenerator
        participants={participants}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  )
}
