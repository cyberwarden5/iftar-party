"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DollarSign, Package, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import FinancialSummary from "@/components/financial-summary"
import { supabase } from "@/lib/supabase"

// Sample data for when Supabase is not configured
const sampleParticipants = [
  {
    id: "1",
    name: "Ahmed Khan",
    date: new Date().toISOString(),
    amount: 500,
    payment_method: "Cash",
  },
  {
    id: "2",
    name: "Fatima Rahman",
    date: new Date(Date.now() - 86400000).toISOString(),
    amount: 400,
    payment_method: "bKash",
  },
  {
    id: "3",
    name: "Mohammad Ali",
    date: new Date(Date.now() - 172800000).toISOString(),
    amount: 350,
    payment_method: "Cash",
  },
]

export default function Dashboard() {
  const [recentParticipants, setRecentParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseAvailable, setSupabaseAvailable] = useState(true)

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSupabaseAvailable(false)
      setRecentParticipants(sampleParticipants)
      setIsLoading(false)
      return
    }

    async function fetchRecentParticipants() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("participants")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error
        setRecentParticipants(data || [])
      } catch (error) {
        console.error("Error fetching recent participants:", error)
        // Fall back to sample data
        setRecentParticipants(sampleParticipants)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentParticipants()

    // Only set up subscription if Supabase is available
    if (supabaseAvailable) {
      const subscription = supabase
        .channel("participants-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "participants",
          },
          () => {
            fetchRecentParticipants()
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [supabaseAvailable])

  return (
    <div className="container mx-auto p-4">
      <FinancialSummary />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-100">Recent Participants</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700/30 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-blue-800/30">
            <div className="bg-slate-900/50 p-4">
              {recentParticipants.length === 0 ? (
                <p className="text-center py-4 text-slate-400">No participants added yet</p>
              ) : (
                <ul className="divide-y divide-blue-800/30">
                  {recentParticipants.map((participant) => (
                    <li key={participant.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-slate-400">{new Date(participant.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">৳{participant.amount.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">{participant.payment_method}</p>
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

        {!supabaseAvailable && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-md text-yellow-200">
            <p className="text-sm">
              <strong>Note:</strong> Displaying sample data. Connect Supabase for real-time data.
            </p>
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
