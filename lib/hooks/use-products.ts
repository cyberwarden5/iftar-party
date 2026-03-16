"use client"

import useSWR from "swr"
import { getProducts } from "@/lib/data"

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR("products", async () => {
    return await getProducts()
  })

  return {
    products: data || [],
    isLoading,
    error,
    mutate,
  }
}
