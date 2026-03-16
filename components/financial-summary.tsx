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
        <h2 className="text-2xl font-bold text-foreground mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <span>💰</span>
        Financial Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
              <Wallet className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">৳{financialData.totalCollected.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">{financialData.participantCount} participants</p>
          </CardContent>
        </Card>

        <Card className="card bg-gradient-to-br from-error/10 to-error/5 dark:from-error/20 dark:to-error/10 border-error/20 dark:border-error/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <TrendingDown className="h-5 w-5 text-error" />
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">৳{financialData.totalSpent.toLocaleString()}</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{spendingPercentage}% used</span>
              </div>
              <Progress value={spendingPercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="card bg-gradient-to-br from-success/10 to-success/5 dark:from-success/20 dark:to-success/10 border-success/20 dark:border-success/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Remaining Balance</p>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">৳{financialData.totalRemaining.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {financialData.totalCollected
                ? Math.round((financialData.totalRemaining / financialData.totalCollected) * 100)
                : 0}
              % remaining
            </p>
          </CardContent>
        </Card>

        <Card className="card bg-gradient-to-br from-warning/10 to-warning/5 dark:from-warning/20 dark:to-warning/10 border-warning/20 dark:border-warning/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Average Contribution</p>
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
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
