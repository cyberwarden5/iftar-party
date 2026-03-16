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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your Iftar party overview.
        </p>
      </div>

      {/* Financial Summary */}
      <FinancialSummary />

      {/* Recent Participants */}
      <div className="animate-slide-in">
        <h2 className="text-2xl font-bold text-foreground mb-4">Recent Participants</h2>
        {isLoading ? (
          <div className="card p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-secondary rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            {recentParticipants.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">No participants added yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentParticipants.map((participant, idx) => (
                  <li 
                    key={participant.id} 
                    className="p-4 flex justify-between items-center hover:bg-secondary transition-colors"
                    style={{
                      animation: `slideIn 0.3s ease-out ${idx * 0.1}s backwards`
                    }}
                  >
                    <div>
                      <p className="font-medium text-foreground">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(participant.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">৳{participant.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{participant.paymentMethod}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {recentParticipants.length > 0 && (
              <div className="border-t border-border p-4 text-center bg-secondary/50">
                <Button asChild variant="ghost" className="text-primary-600 hover:text-primary-700">
                  <Link href="/dashboard/participants">View All Participants →</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <Card className="card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary-600" />
              Participants
            </CardTitle>
            <CardDescription>Manage party participants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Add new participants and track their payments.</p>
            <Button asChild className="btn btn-primary w-full">
              <Link href="/dashboard/participants">Manage Participants</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-primary-600" />
              Products
            </CardTitle>
            <CardDescription>Manage party items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Add and update products like biriyani, juice, and water.</p>
            <Button asChild className="btn btn-primary w-full">
              <Link href="/dashboard/products">Manage Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-primary-600" />
              Finances
            </CardTitle>
            <CardDescription>Financial overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">View detailed financial reports and summaries.</p>
            <Button asChild className="btn btn-primary w-full">
              <Link href="/dashboard/finances">View Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
