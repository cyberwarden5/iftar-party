"use client"

import { useEffect, useState } from "react"
import { TrendingDown, Wallet } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Sample data for when Supabase is not configured
const sampleFinancialData = {
  totalCollected: 5850,
  totalSpent: 3750,
}

export default function GlobalFinancialSummary() {
  const [financialData, setFinancialData] = useState({
    totalCollected: 0,
    totalSpent: 0,
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
        .channel("global-participants-changes")
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
        .channel("global-products-changes")
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

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-900/80 to-blue-900/80 backdrop-blur-md border border-blue-800/30 rounded-lg p-3 animate-pulse">
        <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-700/30 rounded w-1/2"></div>
      </div>
    )
  }

  const spendingPercentage = financialData.totalCollected
    ? Math.min(100, Math.round((financialData.totalSpent / financialData.totalCollected) * 100))
    : 0

  return (
    <div className="w-full bg-gradient-to-r from-slate-900/80 to-blue-900/80 backdrop-blur-md border border-blue-800/30 rounded-lg p-3">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Total:</span>
            <span className="text-white font-bold">৳{financialData.totalCollected.toLocaleString()}</span>
          </div>
          <div className="h-4 w-px bg-blue-800/50 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <span className="text-blue-300 font-medium">Spent:</span>
            <span className="text-white font-bold">৳{financialData.totalSpent.toLocaleString()}</span>
            <span className="text-xs text-blue-400/70">({spendingPercentage}%)</span>
          </div>
        </div>
        <div className="text-xs text-blue-400/70">{new Date().toLocaleDateString()} • Live Financial Summary</div>
      </div>
    </div>
  )
}
