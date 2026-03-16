"use client"

import { useEffect, useState } from "react"
import { Plus, Trash } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { JsonDatabase } from "@/lib/json-db"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  code: z.string().min(6, { message: "Access code must be at least 6 characters" }),
  createdBy: z.string().min(2, { message: "Creator name is required" }),
})

export default function SettingsPage() {
  const [accessCodes, setAccessCodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      createdBy: "",
    },
  })

  useEffect(() => {
    JsonDatabase.initialize()
    fetchAccessCodes()

    // Listen for database changes
    const handleDatabaseChange = () => {
      fetchAccessCodes()
    }

    window.addEventListener("databaseChange", handleDatabaseChange)
    return () => window.removeEventListener("databaseChange", handleDatabaseChange)
  }, [])

  function fetchAccessCodes() {
    try {
      setIsLoading(true)
      const codes = JsonDatabase.getAuthCodes().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setAccessCodes(codes)
    } catch (error) {
      console.error("Error fetching access codes:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load access codes. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const added = JsonDatabase.addAuthCode(values.code, values.createdBy)

      if (!added) {
        toast({
          variant: "destructive",
          title: "Duplicate Code",
          description: "This access code already exists.",
        })
        return
      }

      toast({
        title: "Success ✨",
        description: "New access code added successfully",
      })

      form.reset()
      fetchAccessCodes()
    } catch (error) {
      console.error("Failed to add access code:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add access code. Please try again.",
      })
    }
  }

  const handleDelete = async () => {
    if (!codeToDelete) return

    try {
      // Don't allow deleting the default code
      const codeToRemove = accessCodes.find((code) => code.id === codeToDelete)
      if (codeToRemove?.code === "AFTABx7766") {
        toast({
          variant: "destructive",
          title: "Cannot Delete Default Code",
          description: "The default access code cannot be deleted.",
        })
        setCodeToDelete(null)
        return
      }

      const success = JsonDatabase.deleteAuthCode(codeToDelete)

      if (!success) {
        throw new Error("Failed to delete access code")
      }

      toast({
        title: "Success ✨",
        description: "Access code deleted successfully",
      })
      
      fetchAccessCodes()
    } catch (error) {
      console.error("Failed to delete access code:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete access code. Please try again.",
      })
    } finally {
      setCodeToDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle>Access Codes</CardTitle>
            <CardDescription className="text-slate-400">Manage access codes for the application</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700/30 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-800/30 hover:bg-transparent">
                      <TableHead className="text-blue-300">Code</TableHead>
                      <TableHead className="text-blue-300">Created By</TableHead>
                      <TableHead className="text-blue-300">Date</TableHead>
                      <TableHead className="text-blue-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessCodes.length === 0 ? (
                      <TableRow className="border-blue-800/30 hover:bg-blue-950/20">
                        <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                          No access codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      accessCodes.map((code) => (
                        <TableRow key={code.id} className="border-blue-800/30 hover:bg-blue-950/20">
                          <TableCell className="font-medium">{code.code}</TableCell>
                          <TableCell>{code.created_by}</TableCell>
                          <TableCell>{new Date(code.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCodeToDelete(code.id)}
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                              disabled={code.code === "AFTABx7766"} // Disable delete for default code
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle>Add New Access Code</CardTitle>
            <CardDescription className="text-slate-400">Create a new access code for login</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100">🔐 Access Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., SecurePass123"
                          {...field}
                          className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring focus:ring-blue-400/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="createdBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100">👤 Created By</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          {...field}
                          className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring focus:ring-blue-400/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Access Code
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!codeToDelete} onOpenChange={() => setCodeToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-blue-800/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the access code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
