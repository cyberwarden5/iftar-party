"use client"

import { useEffect, useState } from "react"
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { JsonDatabase } from "@/lib/json-db"

export default function FinancialSummary() {
  const [financialData, setFinancialData] = useState({
    totalCollected: 0,
    totalSpent: 0,
    totalRemaining: 0,
    participantCount: 0,
    paidCount: 0,
    averageContribution: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    JsonDatabase.initialize()
    
    const fetchData = () => {
      try {
        setLoading(true)
        const data = JsonDatabase.getFinancialData()
        setFinancialData(data)
      } catch (error) {
        console.error("[v0] Failed to fetch financial data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for database changes
    const handleDatabaseChange = () => {
      fetchData()
    }

    window.addEventListener("databaseChange", handleDatabaseChange)
    return () => window.removeEventListener("databaseChange", handleDatabaseChange)
  }, [])

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
    </div>
  )
}
