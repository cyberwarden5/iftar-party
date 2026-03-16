"use client"

import { useEffect, useState } from "react"
import { Edit, Filter, Plus, Search, ShoppingCart, Trash, AlertCircle, ChevronDown, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { getPaidParticipantsCount, markProductAsManuallyAdjusted } from "@/lib/product-utils"

// Sample data for when Supabase is not configured
const sampleProducts = [
  {
    id: "prod1",
    name: "Biriyani",
    price: 150,
    quantity: 12,
    purchase_status: "not_purchased",
    manually_adjusted: null,
  },
  {
    id: "prod2",
    name: "Juice",
    price: 30,
    quantity: 12,
    purchase_status: "purchased",
    manually_adjusted: null,
  },
  {
    id: "prod3",
    name: "Water",
    price: 15,
    quantity: 12,
    purchase_status: "not_purchased",
    manually_adjusted: null,
  },
]

// Form schema for product validation
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  quantity: z.coerce.number().min(1, { message: "Quantity is required" }),
  purchase_status: z.enum(["purchased", "not_purchased"]),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [paidParticipantsCount, setPaidParticipantsCount] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Initialize form with react-hook-form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 0,
      purchase_status: "not_purchased",
    },
  })

  // Reset form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        purchase_status: editingProduct.purchase_status || "not_purchased",
      })
    } else {
      form.reset({
        name: "",
        price: 0,
        quantity: paidParticipantsCount || 0,
        purchase_status: "not_purchased",
      })
    }
  }, [editingProduct, form, paidParticipantsCount])

  // Function to fetch products data
  const fetchProducts = async () => {
    try {
      setIsLoading(true)

      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setProducts(sampleProducts)
        return sampleProducts
      }

      const { data, error } = await supabase.from("products").select("*").order("name")

      if (error) throw error
      setProducts(data || [])
      return data || []
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again.",
      })
      // Fall back to sample data
      setProducts(sampleProducts)
      return sampleProducts
    } finally {
      setIsLoading(false)
    }
  }

  // Function to fetch paid participants count
  const fetchPaidParticipantsCount = async () => {
    try {
      const count = await getPaidParticipantsCount()
      setPaidParticipantsCount(count)
      return count
    } catch (error) {
      console.error("Error fetching paid participants count:", error)
      // Fall back to sample count
      setPaidParticipantsCount(12)
      return 12
    }
  }

  // Function to refresh all data
  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchProducts(), fetchPaidParticipantsCount()])
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    refreshData()

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
          refreshData()
        },
      )
      .subscribe()

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
          fetchPaidParticipantsCount()
        },
      )
      .subscribe()

    return () => {
      productsSubscription.unsubscribe()
      participantsSubscription.unsubscribe()
    }
  }, [])

  // Handle form submission (add/update product)
  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Submitting product form:", values)

      // Check if Supabase is available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Demo mode - update local state
        if (editingProduct) {
          setProducts(products.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...values } : p)))
        } else {
          setProducts([...products, { ...values, id: `prod${Date.now()}` }])
        }

        toast({
          title: "Success",
          description: editingProduct ? "Product updated successfully" : "Product added successfully",
        })

        setShowAddForm(false)
        setEditingProduct(null)
        return
      }

      // Check for duplicate product name
      const isDuplicate = products.some(
        (p) => p.name.toLowerCase() === values.name.toLowerCase() && (!editingProduct || p.id !== editingProduct.id),
      )

      if (isDuplicate) {
        toast({
          variant: "destructive",
          title: "Duplicate Product",
          description: "A product with this name already exists. Please use a different name.",
        })
        setIsSubmitting(false)
        return
      }

      if (editingProduct) {
        console.log("Updating product:", editingProduct.id, values)

        // Check if quantity was changed
        const quantityChanged = editingProduct.quantity !== values.quantity

        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: values.name,
            price: values.price,
            quantity: values.quantity,
            purchase_status: values.purchase_status,
            manually_adjusted: quantityChanged ? true : editingProduct.manually_adjusted,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id)

        if (error) {
          console.error("Error updating product:", error)
          throw error
        }

        // If quantity was changed, mark as manually adjusted
        if (quantityChanged) {
          await markProductAsManuallyAdjusted(editingProduct.id)
        }

        console.log("Product updated successfully")
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        console.log("Adding new product:", values)
        // Add new product
        const { error } = await supabase.from("products").insert({
          name: values.name,
          price: values.price,
          quantity: values.quantity,
          purchase_status: values.purchase_status,
          manually_adjusted: values.quantity !== paidParticipantsCount ? true : null,
        })

        if (error) {
          console.error("Error adding product:", error)
          throw error
        }

        console.log("Product added successfully")
        toast({
          title: "Success",
          description: "Product added successfully",
        })
      }

      // Refresh data
      await refreshData()

      // Reset form and close modal
      form.reset()
      setShowAddForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("Failed to save product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle product deletion
  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      console.log("Deleting product:", productToDelete)

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase.from("products").delete().eq("id", productToDelete)

        if (error) {
          console.error("Error deleting product:", error)
          throw error
        }

        console.log("Product deleted successfully")
      } else {
        // Demo mode - update local state
        setProducts(products.filter((p) => p.id !== productToDelete))
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      // Refresh data
      await refreshData()
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again.",
      })
    } finally {
      setProductToDelete(null)
    }
  }

  // Toggle product purchase status
  const togglePurchaseStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "purchased" ? "not_purchased" : "purchased"

    try {
      console.log("Toggling product status:", productId, "from", currentStatus, "to", newStatus)

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await supabase
          .from("products")
          .update({
            purchase_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId)

        if (error) {
          console.error("Error updating product status:", error)
          throw error
        }

        console.log("Product status updated successfully")
      } else {
        // Demo mode - update local state
        setProducts(products.map((p) => (p.id === productId ? { ...p, purchase_status: newStatus } : p)))
      }

      toast({
        title: "Status Updated",
        description: `Product marked as ${newStatus === "purchased" ? "purchased" : "not purchased"}`,
      })

      // Refresh data
      await refreshData()
    } catch (error) {
      console.error("Failed to update product status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product status. Please try again.",
      })
    }
  }

  // Filter products based on search term and status filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "purchased" && product.purchase_status === "purchased") ||
      (statusFilter === "not_purchased" && product.purchase_status === "not_purchased")
    return matchesSearch && matchesStatus
  })

  // Calculate total cost of all products
  const totalCost = products.reduce((sum, product) => sum + product.price * product.quantity, 0)

  // Calculate total cost of purchased products
  const purchasedCost = products
    .filter((p) => p.purchase_status === "purchased")
    .reduce((sum, product) => sum + product.price * product.quantity, 0)

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products Management</h1>
          <p className="text-blue-300">Manage food items for {paidParticipantsCount} confirmed participants</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            onClick={refreshData}
            variant="outline"
            size="icon"
            className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button
            onClick={() => {
              setEditingProduct(null)
              setShowAddForm(true)
            }}
            className="w-full md:w-auto ramadan-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {(showAddForm || editingProduct) && (
        <Card className="mb-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border-blue-800/30 text-white ramadan-card">
          <CardHeader>
            <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
            <CardDescription className="text-slate-400">
              {editingProduct
                ? "Update product details"
                : `Enter the product details below. Quantity will be set to ${paidParticipantsCount} automatically.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Biriyani"
                            {...field}
                            className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-100">Price per Unit (৳)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100">Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={paidParticipantsCount.toString()}
                          {...field}
                          className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchase_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-100">Purchase Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-blue-800/30 text-white">
                            <SelectValue placeholder="Select purchase status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-blue-800/30 text-white">
                          <SelectItem value="purchased">Purchased</SelectItem>
                          <SelectItem value="not_purchased">Not Purchased</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingProduct(null)
                    }}
                    className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="ramadan-button">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-900/50 border-blue-800/30 text-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-400" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-blue-800/30 text-white">
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="not_purchased">Not Purchased</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md border-blue-800/30 text-white ramadan-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle>Products List</CardTitle>
              <CardDescription className="text-slate-400">
                Showing {filteredProducts.length} of {products.length} products
              </CardDescription>
            </div>
            <div className="mt-2 md:mt-0 flex flex-col items-end">
              <div className="text-sm text-blue-300">
                <span className="font-medium">Purchased:</span>{" "}
                <span className="text-white">৳{purchasedCost.toLocaleString()}</span>
                <span className="text-xs text-blue-400/70 ml-1">
                  ({totalCost > 0 ? Math.round((purchasedCost / totalCost) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
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
                    <TableHead className="text-blue-300">Product Name</TableHead>
                    <TableHead className="text-blue-300">Price per Unit (৳)</TableHead>
                    <TableHead className="text-blue-300">
                      <div className="flex items-center gap-1">
                        <span>Quantity</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-3.5 w-3.5 text-blue-400/70" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 border-blue-800/30 text-white">
                              <p>Default quantity is set to match paid participants</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="text-blue-300">Total Cost (৳)</TableHead>
                    <TableHead className="text-blue-300">Purchase Status</TableHead>
                    <TableHead className="text-blue-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow className="border-blue-800/30 hover:bg-blue-950/20">
                      <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                        {searchTerm || statusFilter !== "all"
                          ? "No products match your search or filter"
                          : "No products added yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className={`border-blue-800/30 hover:bg-blue-950/20 ${
                          product.purchase_status === "purchased" ? "bg-green-900/10" : ""
                        } ${product.manually_adjusted ? "border-l-2 border-l-amber-500" : ""}`}
                      >
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>৳{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {product.quantity}
                            {product.manually_adjusted && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                                      M
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-blue-800/30 text-white">
                                    <p>Manually adjusted quantity</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>৳{(product.price * product.quantity).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.purchase_status === "purchased"
                                ? "bg-green-500/20 text-green-400 cursor-pointer"
                                : "bg-yellow-500/20 text-yellow-400 cursor-pointer"
                            }
                            onClick={() => togglePurchaseStatus(product.id, product.purchase_status)}
                          >
                            <div className="flex items-center gap-1">
                              {product.purchase_status === "purchased" ? (
                                <>
                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                  Purchased
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                  Not Purchased
                                </>
                              )}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                              >
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] bg-slate-900 border-blue-800/30">
                              <DropdownMenuLabel className="text-blue-300">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-blue-800/30" />
                              <DropdownMenuItem
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-300 focus:text-blue-100 cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => togglePurchaseStatus(product.id, product.purchase_status)}
                                className="text-blue-300 focus:text-blue-100 cursor-pointer"
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {product.purchase_status === "purchased"
                                  ? "Mark as Not Purchased"
                                  : "Mark as Purchased"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-blue-800/30" />
                              <DropdownMenuItem
                                onClick={() => setProductToDelete(product.id)}
                                className="text-red-400 focus:text-red-300 cursor-pointer"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <tfoot className="border-t border-blue-800/30">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-semibold text-blue-300">
                      Total Cost:
                    </td>
                    <td className="py-3 px-4 font-bold text-white">৳{totalCost.toLocaleString()}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-blue-800/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the product.
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
