"use client"

import { useState, useEffect } from "react"
import { getParticipants } from "@/lib/data"

export function useParticipants() {
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const data = await getParticipants()
        setParticipants(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch participants"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { participants, isLoading, error }
}
