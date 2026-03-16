"use client"

export interface Participant {
  id: string
  name: string
  amount: number
  paymentMethod: "Cash" | "bKash"
  transactionId?: string
  date: string
}

export interface Product {
  id: string
  name: string
  price: number
  quantity: number
  status: "Purchased" | "Not Purchased"
}

export interface AuthCode {
  id: string
  code: string
  createdAt: string
  isActive: boolean
}

export interface Settings {
  theme: "light" | "dark"
  partyName: string
  partyDate: string
  partyVenue: string
  minParticipationAmount: number
  authCodes: AuthCode[]
}

const STORAGE_KEY = "iftarPartyData"
const SETTINGS_KEY = "iftarPartySettings"

// Default settings
const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  partyName: "BATCH-22 IFTAR PARTY",
  partyDate: "26/3/25 (25th Ramadan)",
  partyVenue: "Balakhal J.N High School",
  minParticipationAmount: 400,
  authCodes: [
    {
      id: "1",
      code: "AFTABx7766",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
  ],
}

// Participants
export function getParticipants(): Participant[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    const parsed = JSON.parse(data)
    return parsed.participants || []
  } catch {
    return []
  }
}

export function addParticipant(participant: Omit<Participant, "id">): Participant {
  const participants = getParticipants()
  const newParticipant: Participant = {
    ...participant,
    id: `p${Date.now()}`,
  }
  participants.push(newParticipant)
  saveData({ participants, products: getProducts() })
  return newParticipant
}

export function updateParticipant(id: string, updates: Partial<Participant>): Participant {
  const participants = getParticipants()
  const index = participants.findIndex((p) => p.id === id)
  if (index === -1) throw new Error("Participant not found")
  participants[index] = { ...participants[index], ...updates }
  saveData({ participants, products: getProducts() })
  return participants[index]
}

export function deleteParticipant(id: string): void {
  const participants = getParticipants().filter((p) => p.id !== id)
  saveData({ participants, products: getProducts() })
}

// Products
export function getProducts(): Product[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    const parsed = JSON.parse(data)
    return parsed.products || []
  } catch {
    return []
  }
}

export function addProduct(product: Omit<Product, "id">): Product {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: `prod${Date.now()}`,
  }
  products.push(newProduct)
  saveData({ participants: getParticipants(), products })
  return newProduct
}

export function updateProduct(id: string, updates: Partial<Product>): Product {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) throw new Error("Product not found")
  products[index] = { ...products[index], ...updates }
  saveData({ participants: getParticipants(), products })
  return products[index]
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id)
  saveData({ participants: getParticipants(), products })
}

// Settings
export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  const data = localStorage.getItem(SETTINGS_KEY)
  if (!data) {
    saveSettings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
  try {
    return JSON.parse(data)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const current = getSettings()
  const updated = { ...current, ...updates }
  saveSettings(updated)
  return updated
}

export function addAuthCode(code: string): AuthCode {
  const settings = getSettings()
  const newAuthCode: AuthCode = {
    id: `auth${Date.now()}`,
    code,
    createdAt: new Date().toISOString(),
    isActive: true,
  }
  settings.authCodes.push(newAuthCode)
  saveSettings(settings)
  return newAuthCode
}

export function removeAuthCode(id: string): void {
  const settings = getSettings()
  settings.authCodes = settings.authCodes.filter((ac) => ac.id !== id)
  saveSettings(settings)
}

export function verifyAuthCode(code: string): boolean {
  const settings = getSettings()
  return settings.authCodes.some((ac) => ac.code === code && ac.isActive)
}

export function getFinancialData() {
  const participants = getParticipants()
  const products = getProducts()

  const totalCollected = participants.reduce((sum, p) => sum + p.amount, 0)
  const totalSpent = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

  return {
    totalCollected,
    totalSpent,
    totalRemaining: totalCollected - totalSpent,
    participantCount: participants.length,
  }
}

// Private helper functions
function saveData(data: { participants: Participant[]; products: Product[] }) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  // Dispatch event for real-time updates
  window.dispatchEvent(
    new CustomEvent("storageUpdate", { detail: { type: "data", data } }),
  )
}

function saveSettings(settings: Settings) {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  // Dispatch event for real-time updates
  window.dispatchEvent(
    new CustomEvent("storageUpdate", { detail: { type: "settings", data: settings } }),
  )
}

// Initialize with default data if empty
export function initializeStorage() {
  if (typeof window === "undefined") return
  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        participants: [
          {
            id: "p1",
            name: "Ahmed Khan",
            amount: 500,
            paymentMethod: "Cash",
            date: new Date().toISOString(),
          },
        ],
        products: [
          { id: "prod1", name: "Biriyani", price: 150, quantity: 1, status: "Not Purchased" },
          { id: "prod2", name: "Juice", price: 30, quantity: 1, status: "Not Purchased" },
          { id: "prod3", name: "Water", price: 15, quantity: 1, status: "Not Purchased" },
        ],
      }),
    )
  }
  const settingsExisting = localStorage.getItem(SETTINGS_KEY)
  if (!settingsExisting) {
    saveSettings(DEFAULT_SETTINGS)
  }
}
