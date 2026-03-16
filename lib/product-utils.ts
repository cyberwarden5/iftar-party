import { supabase } from "@/lib/supabase"

// Function to update all product quantities based on paid participants count
export async function updateProductQuantities(paidParticipantsCount: number) {
  try {
    // Get all products that are not marked as manually adjusted
    const { data: products, error } = await supabase.from("products").select("*").is("manually_adjusted", null)

    if (error) throw error

    // Update each product's quantity
    const updatePromises =
      products?.map((product) =>
        supabase
          .from("products")
          .update({
            quantity: paidParticipantsCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id),
      ) || []

    await Promise.all(updatePromises)
    return { success: true }
  } catch (error) {
    console.error("Failed to update product quantities:", error)
    return { success: false, error }
  }
}

// Function to mark a product as manually adjusted
export async function markProductAsManuallyAdjusted(productId: string) {
  try {
    const { error } = await supabase
      .from("products")
      .update({
        manually_adjusted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Failed to mark product as manually adjusted:", error)
    return { success: false, error }
  }
}

// Function to get the count of participants who have paid the minimum amount
export async function getPaidParticipantsCount() {
  try {
    const { data, error } = await supabase.from("participants").select("amount")

    if (error) throw error

    const paidCount = (data || []).filter((p) => p.amount >= 400).length
    return paidCount
  } catch (error) {
    console.error("Failed to get paid participants count:", error)
    return 0
  }
}
