"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { updateProductQuantities, getPaidParticipantsCount } from "@/lib/product-utils"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  amount: z.coerce.number().min(1, { message: "Amount is required" }),
  payment_method: z.enum(["Cash", "bKash"]),
  transaction_id: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddParticipantFormProps {
  participant?: any
  onSuccess: () => void
  supabaseAvailable?: boolean
  existingParticipants?: any[]
  onUpdate?: (participant: any) => void
  onAdd?: (participant: any) => void
}

export default function AddParticipantForm({
  participant,
  onSuccess,
  supabaseAvailable = true,
  existingParticipants = [],
  onUpdate,
  onAdd,
}: AddParticipantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: participant?.name || "",
      amount: participant?.amount || 400,
      payment_method: participant?.payment_method || "Cash",
      transaction_id: participant?.transaction_id || "",
    },
  })

  const paymentMethod = form.watch("payment_method")

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Check for duplicate participant name
      const isDuplicate = existingParticipants.some(
        (p) => p.name.toLowerCase() === values.name.toLowerCase() && (!participant || p.id !== participant.id),
      )

      if (isDuplicate) {
        toast({
          variant: "destructive",
          title: "Duplicate Participant",
          description: "A participant with this name already exists. Please use a different name.",
        })
        setIsSubmitting(false)
        return
      }

      if (supabaseAvailable) {
        let shouldUpdateProductQuantities = false
        let wasUnderMinimum = false
        let isNowMinimum = false

        if (participant) {
          // Check if payment amount changed and might affect product quantities
          wasUnderMinimum = participant.amount < 400
          isNowMinimum = values.amount >= 400
          shouldUpdateProductQuantities = wasUnderMinimum && isNowMinimum

          // Update existing participant
          const { error } = await supabase
            .from("participants")
            .update({
              ...values,
              // Keep the original date
            })
            .eq("id", participant.id)

          if (error) throw error

          toast({
            title: "Success",
            description: "Participant updated successfully",
          })

          if (onUpdate) {
            onUpdate({
              ...participant,
              ...values,
            })
          }
        } else {
          // Add new participant
          const { data, error } = await supabase
            .from("participants")
            .insert({
              ...values,
              date: new Date().toISOString(),
            })
            .select()

          if (error) throw error

          toast({
            title: "Success",
            description: "Participant added successfully",
          })

          if (onAdd && data) {
            onAdd(data[0])
          }

          // If the new participant paid the minimum amount, update product quantities
          shouldUpdateProductQuantities = values.amount >= 400
        }

        // Update product quantities if needed
        if (shouldUpdateProductQuantities) {
          try {
            // Get updated paid participants count
            const paidCount = await getPaidParticipantsCount()

            // Update product quantities
            await updateProductQuantities(paidCount)

            if (wasUnderMinimum && isNowMinimum) {
              toast({
                title: "Products Updated",
                description: "Product quantities have been updated based on the new participant status.",
              })
            }
          } catch (error) {
            console.error("Failed to update product quantities:", error)
            // Don't fail the whole operation if this part fails
          }
        }
      } else {
        // Demo mode without Supabase
        if (participant) {
          if (onUpdate) {
            onUpdate({
              ...participant,
              ...values,
            })
          }
        } else {
          if (onAdd) {
            onAdd({
              ...values,
              date: new Date().toISOString(),
            })
          }
        }

        toast({
          title: "Success",
          description: participant ? "Participant updated successfully" : "Participant added successfully",
        })
      }

      form.reset()
      onSuccess()
    } catch (error) {
      console.error("Failed to save participant:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save participant. Please try again.",
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
                <FormLabel className="text-blue-100">Participant Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter name"
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-100">Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="400"
                    {...field}
                    className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
                  />
                </FormControl>
                <FormDescription className="text-slate-400">Minimum contribution is ৳400</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-blue-100">Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Cash" />
                    </FormControl>
                    <FormLabel className="font-normal text-white">Cash</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="bKash" />
                    </FormControl>
                    <FormLabel className="font-normal text-white">bKash</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === "bKash" && (
          <FormField
            control={form.control}
            name="transaction_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-100">Transaction ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter bKash transaction ID"
                    {...field}
                    className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
            ) : participant ? (
              "Update Participant"
            ) : (
              "Add Participant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
