"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DollarSign, Package, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FinancialSummary from "@/components/financial-summary"
import { JsonDatabase } from "@/lib/json-db"

export default function Dashboard() {
  const [recentParticipants, setRecentParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize database
    JsonDatabase.initialize()
    
    // Load recent participants
    const participants = JsonDatabase.getParticipants()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    setRecentParticipants(participants)
    setIsLoading(false)

    // Listen for database changes
    const handleDatabaseChange = (event: any) => {
      const updatedParticipants = event.detail.participants
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
      setRecentParticipants(updatedParticipants)
    }

    window.addEventListener("databaseChange", handleDatabaseChange)
    return () => window.removeEventListener("databaseChange", handleDatabaseChange)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <FinancialSummary />

      <div className="mt-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 text-blue-100">Recent Participants</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700/30 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-blue-800/30 ramadan-card backdrop-blur-md">
            <div className="bg-slate-900/50 p-4">
              {recentParticipants.length === 0 ? (
                <p className="text-center py-4 text-slate-400">No participants added yet</p>
              ) : (
                <ul className="divide-y divide-blue-800/30">
                  {recentParticipants.map((participant, idx) => (
                    <li key={participant.id} className="py-3 flex justify-between items-center hover:bg-blue-950/20 transition-colors duration-300 px-2 rounded" style={{
                      animation: `slideIn 0.3s ease-out ${idx * 0.1}s backwards`
                    }}>
                      <div>
                        <p className="font-medium text-white">{participant.name}</p>
                        <p className="text-sm text-slate-400">{new Date(participant.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-400">৳{participant.amount.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">{participant.paymentMethod}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-slate-900/80 p-3 text-center">
              <Button asChild variant="link" className="text-blue-400 hover:text-blue-300">
                <Link href="/dashboard/participants">View All Participants</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Participants
            </CardTitle>
            <CardDescription className="text-slate-400">Manage party participants</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add new participants and track their payments.</p>
            <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-950">
              <Link href="/dashboard/participants">Manage Participants</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-400" />
              Products
            </CardTitle>
            <CardDescription className="text-slate-400">Manage party items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add and update products like biriyani, juice, and water.</p>
            <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-950">
              <Link href="/dashboard/products">Manage Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              Finances
            </CardTitle>
            <CardDescription className="text-slate-400">Financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View detailed financial reports and summaries.</p>
            <Button asChild variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-950">
              <Link href="/dashboard/finances">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
