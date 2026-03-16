"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, PieChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getFinancialData, getParticipants, getProducts } from "@/lib/data"

export default function FinancesPage() {
  const [financialData, setFinancialData] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [financialData, participants, products] = await Promise.all([
          getFinancialData(),
          getParticipants(),
          getProducts(),
        ])
        setFinancialData(financialData)
        setParticipants(participants)
        setProducts(products)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExportCSV = () => {
    // In a real app, this would generate a CSV file
    alert("This would download a CSV report in a real application")
  }

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
              Financial Reports
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-100">Detailed Financial Reports</h2>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-950 hover:text-blue-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 animate-pulse">
            <div className="h-64 bg-slate-800/50 rounded-lg"></div>
            <div className="h-96 bg-slate-800/50 rounded-lg"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800/30 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">৳{financialData?.totalCollected.toLocaleString()}</div>
                  <p className="text-sm text-blue-300 mt-1">From {participants.length} participants</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">৳{financialData?.totalSpent.toLocaleString()}</div>
                  <p className="text-sm text-blue-300 mt-1">On {products.length} products</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800/30 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Remaining Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">৳{financialData?.totalRemaining.toLocaleString()}</div>
                  <p className="text-sm text-blue-300 mt-1">
                    {Math.round((financialData?.totalRemaining / financialData?.totalCollected) * 100)}% of funds
                    remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average Contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ৳
                    {participants.length
                      ? Math.round(financialData?.totalCollected / participants.length).toLocaleString()
                      : 0}
                  </div>
                  <p className="text-sm text-blue-300 mt-1">Minimum required: ৳400</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-blue-800/30">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-400" />
                      Financial Summary
                    </CardTitle>
                    <CardDescription className="text-slate-400">Overview of your iftar party finances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Income vs Expenses</h3>
                        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-lg border border-blue-800/30">
                          <p className="text-slate-400">
                            [In a real app, this would display a chart showing income vs expenses]
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Financial Highlights</h3>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Total participants:</span>
                            <span className="font-medium">{participants.length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Participants below minimum:</span>
                            <span className="font-medium">{participants.filter((p) => p.amount < 400).length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Total products:</span>
                            <span className="font-medium">{products.length}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Budget utilization:</span>
                            <span className="font-medium">
                              {Math.round((financialData?.totalSpent / financialData?.totalCollected) * 100)}%
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="income">
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
                  <CardHeader>
                    <CardTitle>Income Details</CardTitle>
                    <CardDescription className="text-slate-400">All participant contributions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-blue-800/30 hover:bg-transparent">
                          <TableHead className="text-blue-300">Name</TableHead>
                          <TableHead className="text-blue-300">Date</TableHead>
                          <TableHead className="text-blue-300">Amount</TableHead>
                          <TableHead className="text-blue-300">Payment Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map((participant) => (
                          <TableRow key={participant.id} className="border-blue-800/30 hover:bg-blue-950/20">
                            <TableCell className="font-medium">{participant.name}</TableCell>
                            <TableCell>{new Date(participant.date).toLocaleDateString()}</TableCell>
                            <TableCell>৳{participant.amount.toLocaleString()}</TableCell>
                            <TableCell>{participant.paymentMethod}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="expenses">
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
                  <CardHeader>
                    <CardTitle>Expense Details</CardTitle>
                    <CardDescription className="text-slate-400">All product expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-blue-800/30 hover:bg-transparent">
                          <TableHead className="text-blue-300">Product</TableHead>
                          <TableHead className="text-blue-300">Price per Unit</TableHead>
                          <TableHead className="text-blue-300">Quantity</TableHead>
                          <TableHead className="text-blue-300">Total Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id} className="border-blue-800/30 hover:bg-blue-950/20">
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>৳{product.price.toLocaleString()}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>৳{(product.price * product.quantity).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-blue-800/30 bg-blue-950/30">
                          <TableCell colSpan={3} className="font-bold text-right">
                            Total Expenses
                          </TableCell>
                          <TableCell className="font-bold">৳{financialData?.totalSpent.toLocaleString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t border-blue-800/30 p-4 text-center text-sm text-slate-400">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Iftar Party Organizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
