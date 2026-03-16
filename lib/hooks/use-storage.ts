import { useEffect, useState } from "react"

export function useStorageSync<T>(
  getter: () => T,
  listener?: (data: T) => void,
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    const initialData = getter()
    setData(initialData)
    setIsLoading(false)
    if (listener) listener(initialData)

    // Listen for storage updates
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      const updated = getter()
      setData(updated)
      if (listener) listener(updated)
    }

    window.addEventListener("storageUpdate", handleUpdate)
    return () => window.removeEventListener("storageUpdate", handleUpdate)
  }, [getter, listener])

  return { data, isLoading }
}
