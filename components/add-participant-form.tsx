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
import { JsonDatabase } from "@/lib/json-db"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  amount: z.coerce.number().min(1, { message: "Amount is required" }),
  paymentMethod: z.enum(["Cash", "bKash"]),
  transactionId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddParticipantFormProps {
  participant?: any
  onSuccess: () => void
}

export default function AddParticipantForm({
  participant,
  onSuccess,
}: AddParticipantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: participant?.name || "",
      amount: participant?.amount || 400,
      paymentMethod: participant?.paymentMethod || "Cash",
      transactionId: participant?.transactionId || "",
    },
  })

  const paymentMethod = form.watch("paymentMethod")

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      // Get all participants to check for duplicates
      const allParticipants = JsonDatabase.getParticipants()

      // Check for duplicate participant name
      const isDuplicate = allParticipants.some(
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

      if (participant) {
        // Update existing participant
        const updated = JsonDatabase.updateParticipant(participant.id, {
          name: values.name,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          transactionId: values.transactionId || "",
          date: participant.date, // Keep original date
        })

        if (!updated) {
          throw new Error("Failed to update participant")
        }

        toast({
          title: "Success ✨",
          description: "Participant updated successfully",
        })
      } else {
        // Add new participant
        const added = JsonDatabase.addParticipant({
          name: values.name,
          amount: values.amount,
          paymentMethod: values.paymentMethod,
          transactionId: values.transactionId || "",
          date: new Date().toISOString(),
        })

        if (!added) {
          throw new Error("Failed to add participant")
        }

        toast({
          title: "Success ✨",
          description: "Participant added successfully",
        })
      }

      form.reset()
      onSuccess()
    } catch (error) {
      console.error("[v0] Failed to save participant:", error)
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
                <FormLabel className="text-blue-100">👤 Participant Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter name"
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-100">💰 Amount (৳)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="400"
                    {...field}
                    className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring focus:ring-blue-400/20 transition-all duration-300"
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
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-blue-100">💳 Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-lg hover:bg-blue-950/30 transition-colors duration-300">
                    <FormControl>
                      <RadioGroupItem value="Cash" />
                    </FormControl>
                    <FormLabel className="font-normal text-white cursor-pointer">💵 Cash</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-lg hover:bg-blue-950/30 transition-colors duration-300">
                    <FormControl>
                      <RadioGroupItem value="bKash" />
                    </FormControl>
                    <FormLabel className="font-normal text-white cursor-pointer">📱 bKash</FormLabel>
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
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-100">🔐 Transaction ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter bKash transaction ID"
                    {...field}
                    className="bg-slate-900/50 border-blue-800/30 text-white placeholder:text-slate-500 focus:border-blue-400 focus:ring focus:ring-blue-400/20 transition-all duration-300"
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
            className="border-blue-800/30 text-blue-300 hover:bg-blue-950/50 hover:text-blue-100 transition-all duration-300"
          >
            ✕ Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="ramadan-button transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/50">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : participant ? (
              "✏️ Update Participant"
            ) : (
              "✨ Add Participant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
