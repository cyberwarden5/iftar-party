"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AddProductForm from "@/components/add-product-form"
import { useProducts } from "@/lib/hooks/use-products"
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
import { deleteProduct } from "@/lib/data"

export default function ProductsPage() {
  const { products, isLoading, mutate } = useProducts()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete)
      mutate()
    } catch (error) {
      console.error("Failed to delete product:", error)
    } finally {
      setProductToDelete(null)
    }
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
              Products Management
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => {
              setEditingProduct(null)
              setShowAddForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {(showAddForm || editingProduct) && (
          <Card className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
            <CardHeader>
              <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
              <CardDescription className="text-slate-400">
                {editingProduct ? "Update product details" : "Enter the product details below"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddProductForm
                product={editingProduct}
                onSuccess={() => {
                  setShowAddForm(false)
                  setEditingProduct(null)
                  mutate()
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-800/30 text-white">
          <CardHeader>
            <CardTitle>Products List</CardTitle>
            <CardDescription className="text-slate-400">Manage your iftar party items</CardDescription>
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
                      <TableHead className="text-blue-300">Price (৳)</TableHead>
                      <TableHead className="text-blue-300">Quantity</TableHead>
                      <TableHead className="text-blue-300">Total Cost (৳)</TableHead>
                      <TableHead className="text-blue-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow className="border-blue-800/30 hover:bg-blue-950/20">
                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                          No products added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id} className="border-blue-800/30 hover:bg-blue-950/20">
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>৳{product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>৳{(product.price * product.quantity).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingProduct(product)}
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setProductToDelete(product.id)}
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
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
      </main>

      <footer className="border-t border-blue-800/30 p-4 text-center text-sm text-slate-400">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Iftar Party Organizer. All rights reserved.</p>
        </div>
      </footer>

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
