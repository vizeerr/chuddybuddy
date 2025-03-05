import type { User, Expense } from "@/lib/types"

// Initial sample data
const sampleUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
  },
]

const sampleExpenses: Expense[] = [
  {
    id: "1",
    title: "Grocery Shopping",
    description: "Weekly groceries from Whole Foods",
    amount: 85.42,
    category: "Food & Dining",
    userId: "1",
    userName: "John Doe",
    date: "2023-06-15",
    time: "14:30",
    createdAt: "2023-06-15T14:30:00",
  },
  {
    id: "2",
    title: "Uber Ride",
    description: "Ride to airport",
    amount: 24.99,
    category: "Transportation",
    userId: "2",
    userName: "Jane Smith",
    date: "2023-06-14",
    time: "09:15",
    createdAt: "2023-06-14T09:15:00",
  },
  {
    id: "3",
    title: "Movie Tickets",
    description: "Tickets for new Marvel movie",
    amount: 32.5,
    category: "Entertainment",
    userId: "1",
    userName: "John Doe",
    date: "2023-06-12",
    time: "19:45",
    createdAt: "2023-06-12T19:45:00",
  },
  {
    id: "4",
    title: "Electricity Bill",
    description: "Monthly electricity payment",
    amount: 120.75,
    category: "Utilities",
    userId: "2",
    userName: "Jane Smith",
    date: "2023-06-10",
    time: "10:00",
    createdAt: "2023-06-10T10:00:00",
  },
  {
    id: "5",
    title: "New Headphones",
    description: "Sony WH-1000XM4",
    amount: 89.99,
    category: "Shopping",
    userId: "1",
    userName: "John Doe",
    date: "2023-06-08",
    time: "16:20",
    createdAt: "2023-06-08T16:20:00",
  },
]

// Queue for pending operations when offline
interface PendingOperation {
  type: "addUser" | "updateUser" | "deleteUser" | "addExpense" | "updateExpense" | "deleteExpense"
  data: any
  timestamp: number
}

// Initialize localStorage with sample data if empty
export const initializeStorage = () => {
  if (typeof window === "undefined") return

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(sampleUsers))
  }

  if (!localStorage.getItem("expenses")) {
    localStorage.setItem("expenses", JSON.stringify(sampleExpenses))
  }

  if (!localStorage.getItem("pendingOperations")) {
    localStorage.setItem("pendingOperations", JSON.stringify([]))
  }
}

// Pending operations management
export const addPendingOperation = (operation: Omit<PendingOperation, "timestamp">) => {
  if (typeof window === "undefined") return

  const pendingOps = getPendingOperations()
  const newOperation = { ...operation, timestamp: Date.now() }
  localStorage.setItem("pendingOperations", JSON.stringify([...pendingOps, newOperation]))

  return newOperation
}

export const getPendingOperations = (): PendingOperation[] => {
  if (typeof window === "undefined") return []

  const pendingOps = localStorage.getItem("pendingOperations")
  return pendingOps ? JSON.parse(pendingOps) : []
}

export const clearPendingOperations = () => {
  if (typeof window === "undefined") return

  localStorage.setItem("pendingOperations", JSON.stringify([]))
}

// User CRUD operations
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []

  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : []
}

export const getUserById = (id: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.id === id)
}

export const addUser = (user: Omit<User, "id">): User => {
  const users = getUsers()
  const newUser = {
    ...user,
    id: Date.now().toString(),
  }

  localStorage.setItem("users", JSON.stringify([...users, newUser]))

  // Add to pending operations if needed
  addPendingOperation({
    type: "addUser",
    data: newUser,
  })

  return newUser
}

export const updateUser = (user: User): User => {
  const users = getUsers()
  const updatedUsers = users.map((u) => (u.id === user.id ? user : u))

  localStorage.setItem("users", JSON.stringify(updatedUsers))

  // Add to pending operations if needed
  addPendingOperation({
    type: "updateUser",
    data: user,
  })

  return user
}

export const deleteUser = (id: string): void => {
  const users = getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)

  localStorage.setItem("users", JSON.stringify(filteredUsers))

  // Add to pending operations if needed
  addPendingOperation({
    type: "deleteUser",
    data: { id },
  })
}

// Expense CRUD operations
export const getExpenses = (): Expense[] => {
  if (typeof window === "undefined") return []

  const expenses = localStorage.getItem("expenses")
  return expenses ? JSON.parse(expenses) : []
}

export const getExpenseById = (id: string): Expense | undefined => {
  const expenses = getExpenses()
  return expenses.find((expense) => expense.id === id)
}

export const addExpense = (expense: Omit<Expense, "id" | "userName" | "createdAt">): Expense => {
  const expenses = getExpenses()
  const users = getUsers()
  const user = users.find((u) => u.id === expense.userId)

  const newExpense = {
    ...expense,
    id: Date.now().toString(),
    userName: user?.name || "Unknown User",
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem("expenses", JSON.stringify([...expenses, newExpense]))

  // Add to pending operations if needed
  addPendingOperation({
    type: "addExpense",
    data: newExpense,
  })

  return newExpense
}

export const updateExpense = (expense: Expense): Expense => {
  const expenses = getExpenses()
  const updatedExpenses = expenses.map((e) => (e.id === expense.id ? expense : e))

  localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

  // Add to pending operations if needed
  addPendingOperation({
    type: "updateExpense",
    data: expense,
  })

  return expense
}

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses()
  const filteredExpenses = expenses.filter((expense) => expense.id !== id)

  localStorage.setItem("expenses", JSON.stringify(filteredExpenses))

  // Add to pending operations if needed
  addPendingOperation({
    type: "deleteExpense",
    data: { id },
  })
}

// Analytics
export const getTotalExpenses = (): number => {
  const expenses = getExpenses()
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export const getExpensesByCategory = (): Record<string, number> => {
  const expenses = getExpenses()
  return expenses.reduce(
    (acc, expense) => {
      const { category, amount } = expense
      acc[category] = (acc[category] || 0) + amount
      return acc
    },
    {} as Record<string, number>,
  )
}

export const getExpensesByUser = (): Record<string, number> => {
  const expenses = getExpenses()
  return expenses.reduce(
    (acc, expense) => {
      const { userId, amount } = expense
      acc[userId] = (acc[userId] || 0) + amount
      return acc
    },
    {} as Record<string, number>,
  )
}

export const getMonthlyExpenses = (): Record<string, number> => {
  const expenses = getExpenses()
  return expenses.reduce(
    (acc, expense) => {
      const month = expense.date.substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )
}

