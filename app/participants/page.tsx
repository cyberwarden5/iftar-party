"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import AddParticipantForm from "@/components/add-participant-form"
import { useParticipants } from "@/lib/hooks/use-participants"

export default function ParticipantsPage() {
  const { participants, isLoading } = useParticipants()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900 text-white">
      <header className="border-b border-blue-800/30 p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-blue-300 hover:text-blue-100 hover:bg-blue-950/50"
            >
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Participants Management
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search participants..."
              className="pl-8 bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
            <CardHeader>
              <CardTitle>Add New Participant</CardTitle>
              <CardDescription className="text-slate-400">Enter the participant's details below</CardDescription>
            </CardHeader>
            <CardContent>
              <AddParticipantForm onSuccess={() => setShowAddForm(false)} />
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle>Participants List</CardTitle>
            <CardDescription className="text-slate-400">
              Showing {filteredParticipants.length} of {participants.length} participants
            </CardDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.length === 0 ? (
                      <TableRow className="border-blue-800/30 hover:bg-blue-950/20">
                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                          {searchTerm ? "No participants match your search" : "No participants added yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParticipants.map((participant) => (
                        <TableRow key={participant.id} className="border-blue-800/30 hover:bg-blue-950/20">
                          <TableCell className="font-medium">{participant.name}</TableCell>
                          <TableCell>{new Date(participant.date).toLocaleDateString()}</TableCell>
                          <TableCell>৳{participant.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                participant.paymentMethod === "Cash"
                                  ? "border-green-500 text-green-400"
                                  : "border-blue-500 text-blue-400"
                              }
                            >
                              {participant.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {participant.paymentMethod === "bKash" ? participant.transactionId : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                participant.amount >= 400
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }
                            >
                              {participant.amount >= 400 ? "Paid Minimum" : "Below Minimum"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-blue-800/30 p-4 text-center text-sm text-slate-400">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Iftar Party Organizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
