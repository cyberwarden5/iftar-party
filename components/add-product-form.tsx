"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  quantity: z.coerce.number().min(1, { message: "Quantity is required" }),
  status: z.enum(["Purchased", "Not Purchased"]),
})

type FormValues = z.infer<typeof formSchema>

interface AddProductFormProps {
  product?: any
  paidParticipantsCount: number
  onSuccess: () => void
}

export default function AddProductForm({
  product,
  paidParticipantsCount,
  onSuccess,
  supabaseAvailable = true,
  existingProducts = [],
  onUpdate,
  onAdd,
}: AddProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      quantity: product?.quantity || paidParticipantsCount,
      purchase_status: product?.purchase_status || "not_purchased",
    },
  })

  // Update form values when product or paidParticipantsCount changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        purchase_status: product.purchase_status,
      })
    } else if (paidParticipantsCount > 0) {
      form.setValue("quantity", paidParticipantsCount)
    }
  }, [product, paidParticipantsCount, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Check for duplicate product name
      const isDuplicate = existingProducts.some(
        (p) => p.name.toLowerCase() === values.name.toLowerCase() && (!product || p.id !== product.id),
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

      if (supabaseAvailable) {
        if (product) {
          // Check if quantity was changed
          const quantityChanged = product.quantity !== values.quantity

          // Update existing product
          const { error } = await supabase
            .from("products")
            .update({
              name: values.name,
              price: values.price,
              quantity: values.quantity,
              purchase_status: values.purchase_status,
              // Mark as manually adjusted if quantity was changed
              ...(quantityChanged ? { manually_adjusted: true } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("id", product.id)

          if (error) throw error

          toast({
            title: "Success",
            description: "Product updated successfully",
          })

          if (onUpdate) {
            onUpdate({
              ...product,
              ...values,
              manually_adjusted: quantityChanged ? true : product.manually_adjusted,
            })
          }
        } else {
          // Add new product
          const { data, error } = await supabase
            .from("products")
            .insert({
              name: values.name,
              price: values.price,
              quantity: values.quantity,
              purchase_status: values.purchase_status,
              manually_adjusted: values.quantity !== paidParticipantsCount ? true : null,
            })
            .select()

          if (error) throw error

          toast({
            title: "Success",
            description: "Product added successfully",
          })

          if (onAdd && data) {
            onAdd(data[0])
          }
        }
      } else {
        // Demo mode without Supabase
        if (product) {
          if (onUpdate) {
            onUpdate({
              ...product,
              ...values,
              manually_adjusted: product.quantity !== values.quantity ? true : product.manually_adjusted,
            })
          }
        } else {
          if (onAdd) {
            onAdd({
              ...values,
              id: `prod${Date.now()}`,
              manually_adjusted: values.quantity !== paidParticipantsCount ? true : null,
            })
          }
        }

        toast({
          title: "Success",
          description: product ? "Product updated successfully" : "Product added successfully",
        })
      }

      form.reset()
      onSuccess()
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

  return (
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
            onClick={onSuccess}
            className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : product ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
