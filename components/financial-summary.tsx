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
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <span>💰</span>
        Financial Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Total Collected</p>
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">৳{financialData.totalCollected.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{financialData.participantCount} participants</p>
          </CardContent>
        </Card>

        <Card className="card bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Total Spent</p>
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">৳{financialData.totalSpent.toLocaleString()}</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400">{spendingPercentage}% used</span>
              </div>
              <Progress value={spendingPercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="card bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Remaining Balance</p>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">৳{financialData.totalRemaining.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {financialData.totalCollected
                ? Math.round((financialData.totalRemaining / financialData.totalCollected) * 100)
                : 0}
              % remaining
            </p>
          </CardContent>
        </Card>

        <Card className="card bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Average Contribution</p>
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
              ৳
              {financialData.participantCount
                ? Math.round(financialData.totalCollected / financialData.participantCount).toLocaleString()
                : 0}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Min: ৳400</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
