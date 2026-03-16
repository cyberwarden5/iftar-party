// This is a mock data service that would be replaced with actual API calls in a real application

// Mock data store
const participants = [
  {
    id: "p1",
    name: "Ahmed Khan",
    date: "2024-03-20T10:30:00Z",
    amount: 500,
    paymentMethod: "Cash",
    transactionId: "",
  },
  {
    id: "p2",
    name: "Fatima Rahman",
    date: "2024-03-21T14:15:00Z",
    amount: 400,
    paymentMethod: "bKash",
    transactionId: "BK123456789",
  },
  {
    id: "p3",
    name: "Mohammad Ali",
    date: "2024-03-21T16:45:00Z",
    amount: 350,
    paymentMethod: "Cash",
    transactionId: "",
  },
]

let products = [
  {
    id: "prod1",
    name: "Biriyani",
    price: 150,
    quantity: 50,
  },
  {
    id: "prod2",
    name: "Juice",
    price: 30,
    quantity: 60,
  },
  {
    id: "prod3",
    name: "Water",
    price: 15,
    quantity: 100,
  },
]

// Helper function to simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Financial data
export async function getFinancialData() {
  await delay(800)

  const totalCollected = participants.reduce((sum, p) => sum + p.amount, 0)
  const totalSpent = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

  return {
    totalCollected,
    totalSpent,
    totalRemaining: totalCollected - totalSpent,
    participantCount: participants.length,
  }
}

// Participants
export async function getParticipants() {
  await delay(600)
  return [...participants]
}

export async function addParticipant(participant: any) {
  await delay(800)
  const newParticipant = {
    ...participant,
    id: `p${Date.now()}`,
  }
  participants.push(newParticipant)
  return newParticipant
}

// Products
export async function getProducts() {
  await delay(600)
  return [...products]
}

export async function addProduct(product: any) {
  await delay(800)
  const newProduct = {
    ...product,
    id: `prod${Date.now()}`,
  }
  products.push(newProduct)
  return newProduct
}

export async function updateProduct(id: string, data: any) {
  await delay(800)
  const index = products.findIndex((p) => p.id === id)
  if (index !== -1) {
    products[index] = { ...products[index], ...data }
    return products[index]
  }
  throw new Error("Product not found")
}

export async function deleteProduct(id: string) {
  await delay(800)
  const initialLength = products.length
  products = products.filter((p) => p.id !== id)
  if (products.length === initialLength) {
    throw new Error("Product not found")
  }
  return { success: true }
}
