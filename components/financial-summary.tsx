"use client"

import { useEffect, useState } from "react"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"

// Sample data for when Supabase is not configured
const sampleFinancialData = {
  totalCollected: 5850,
  totalSpent: 3750,
  totalRemaining: 2100,
  participantCount: 12,
}

export default function FinancialSummary() {
  const [financialData, setFinancialData] = useState({
    totalCollected: 0,
    totalSpent: 0,
    totalRemaining: 0,
    participantCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [supabaseAvailable, setSupabaseAvailable] = useState(true)

  useEffect(() => {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setSupabaseAvailable(false)
      setFinancialData(sampleFinancialData)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Get participants data
        const { data: participants, error: participantsError } = await supabase.from("participants").select("amount")

        if (participantsError) throw participantsError

        // Get products data
        const { data: products, error: productsError } = await supabase.from("products").select("price, quantity")

        if (productsError) throw productsError

        // Calculate financial data
        const totalCollected = participants?.reduce((sum, p) => sum + p.amount, 0) || 0
        const totalSpent = products?.reduce((sum, p) => sum + p.price * p.quantity, 0) || 0

        setFinancialData({
          totalCollected,
          totalSpent,
          totalRemaining: totalCollected - totalSpent,
          participantCount: participants?.length || 0,
        })
      } catch (error) {
        console.error("Failed to fetch financial data:", error)
        // Fall back to sample data
        setFinancialData(sampleFinancialData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Only set up subscriptions if Supabase is available
    if (supabaseAvailable) {
      // Set up real-time subscription for participants
      const participantsSubscription = supabase
        .channel("participants-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "participants",
          },
          () => {
            fetchData()
          },
        )
        .subscribe()

      // Set up real-time subscription for products
      const productsSubscription = supabase
        .channel("products-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "products",
          },
          () => {
            fetchData()
          },
        )
        .subscribe()

      return () => {
        participantsSubscription.unsubscribe()
        productsSubscription.unsubscribe()
      }
    }
  }, [supabaseAvailable])

  const spendingPercentage = financialData.totalCollected
    ? Math.min(100, Math.round((financialData.totalSpent / financialData.totalCollected) * 100))
    : 0

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-100">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-100 flex items-center">
        <div className="w-5 h-5 mr-2 relative">
          <div className="w-4 h-4 bg-blue-500 rounded-full absolute left-0 top-0.5"></div>
          <div className="w-3 h-3 bg-slate-900 rounded-full absolute left-1.5 top-0.5"></div>
        </div>
        Financial Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700/30 text-white ramadan-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">Total Collected</p>
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">৳{financialData.totalCollected.toLocaleString()}</p>
            <p className="text-sm text-blue-300 mt-1">{financialData.participantCount} participants</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-blue-800/30 text-white ramadan-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">Total Spent</p>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold mt-2">৳{financialData.totalSpent.toLocaleString()}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{spendingPercentage}% of budget used</span>
              </div>
              <Progress value={spendingPercentage} className="h-1.5 bg-blue-950" indicatorClassName="bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-700/30 text-white ramadan-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">Remaining Balance</p>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold mt-2">৳{financialData.totalRemaining.toLocaleString()}</p>
            <p className="text-sm text-blue-300 mt-1">
              {financialData.totalCollected
                ? Math.round((financialData.totalRemaining / financialData.totalCollected) * 100)
                : 0}
              % of funds remaining
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-blue-800/30 text-white ramadan-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-300">Average Contribution</p>
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">
              ৳
              {financialData.participantCount
                ? Math.round(financialData.totalCollected / financialData.participantCount).toLocaleString()
                : 0}
            </p>
            <p className="text-sm text-blue-300 mt-1">Minimum required: ৳400</p>
          </CardContent>
        </Card>
      </div>

      {!supabaseAvailable && (
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-md text-yellow-200">
          <p className="text-sm">
            <strong>Note:</strong> Displaying sample data. Connect Supabase for real-time data.
          </p>
        </div>
      )}
    </div>
  )
}
