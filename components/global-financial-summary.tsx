"use client"

import { useEffect, useState } from "react"
import { TrendingDown, Wallet } from "lucide-react"
import { JsonDatabase } from "@/lib/json-db"

export default function GlobalFinancialSummary() {
  const [financialData, setFinancialData] = useState({
    totalCollected: 0,
    totalSpent: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    JsonDatabase.initialize()
    fetchData()

    // Listen for database changes
    const handleDatabaseChange = () => {
      fetchData()
    }

    window.addEventListener("databaseChange", handleDatabaseChange)
    return () => window.removeEventListener("databaseChange", handleDatabaseChange)
  }, [])

  const fetchData = () => {
    try {
      setLoading(true)
      const data = JsonDatabase.getFinancialData()
      setFinancialData({
        totalCollected: data.totalCollected,
        totalSpent: data.totalSpent,
      })
    } catch (error) {
      console.error("[v0] Failed to fetch financial data:", error)
    } finally {
      setLoading(false)
    }
  }

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
