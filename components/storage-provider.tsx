"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Expense } from "@/lib/types"
import {
  initializeStorage,
  getUsers,
  getExpenses,
  addUser,
  updateUser,
  deleteUser,
  addExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/storage"
import {
  createUser,
  updateUserInFirebase,
  deleteUserFromFirebase,
  createExpense,
  updateExpenseInFirebase,
  deleteExpenseFromFirebase,
  subscribeToUsers,
  subscribeToExpenses,
  syncLocalToFirebase,
  syncFirebaseToLocal,
} from "@/lib/firebase"

interface StorageContextType {
  users: User[]
  expenses: Expense[]
  addUser: (user: Omit<User, "id">) => Promise<User>
  updateUser: (user: User) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  addExpense: (expense: Omit<Expense, "id" | "userName" | "createdAt">) => Promise<Expense>
  updateExpense: (expense: Expense) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
  loading: boolean
  syncStatus: "idle" | "syncing" | "synced" | "error"
  syncNow: () => Promise<void>
  isOnline: boolean
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle")
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Initialize data from localStorage and then sync with Firebase
  useEffect(() => {
    const initData = async () => {
      try {
        // First load from localStorage for immediate UI
        initializeStorage()
        setUsers(getUsers())
        setExpenses(getExpenses())
        setLoading(false)

        // Then try to sync with Firebase if online
        if (isOnline) {
          await syncWithFirebase()
        }
      } catch (error) {
        console.error("Error initializing data:", error)
        setLoading(false)
      }
    }

    initData()
  }, [isOnline])

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    if (!isOnline) return

    const unsubscribeUsers = subscribeToUsers((firebaseUsers) => {
      setUsers(firebaseUsers)
      localStorage.setItem("users", JSON.stringify(firebaseUsers))
    })

    const unsubscribeExpenses = subscribeToExpenses((firebaseExpenses) => {
      setExpenses(firebaseExpenses)
      localStorage.setItem("expenses", JSON.stringify(firebaseExpenses))
    })

    return () => {
      unsubscribeUsers()
      unsubscribeExpenses()
    }
  }, [isOnline])

  // Sync with Firebase when coming back online
  useEffect(() => {
    if (isOnline) {
      syncWithFirebase()
    }
  }, [isOnline])

  const syncWithFirebase = async () => {
    if (!isOnline) return

    try {
      setSyncStatus("syncing")

      // First push local changes to Firebase
      await syncLocalToFirebase()

      // Then get the latest data from Firebase
      const { users: firebaseUsers, expenses: firebaseExpenses } = (await syncFirebaseToLocal()) || {
        users: [],
        expenses: [],
      }

      setUsers(firebaseUsers)
      setExpenses(firebaseExpenses)

      setSyncStatus("synced")
    } catch (error) {
      console.error("Error syncing with Firebase:", error)
      setSyncStatus("error")
    }
  }

  const handleAddUser = async (user: Omit<User, "id">) => {
    try {
      let newUser: User

      if (isOnline) {
        // Add to Firebase
        newUser = await createUser(user)
      } else {
        // Add to localStorage only
        newUser = addUser(user)
      }

      // Update state
      setUsers([...users, newUser])
      return newUser
    } catch (error) {
      console.error("Error adding user:", error)
      // Fallback to localStorage
      const newUser = addUser(user)
      setUsers([...users, newUser])
      return newUser
    }
  }

  const handleUpdateUser = async (user: User) => {
    try {
      if (isOnline) {
        // Update in Firebase
        await updateUserInFirebase(user)
      }

      // Always update in localStorage
      updateUser(user)

      // Update state
      setUsers(users.map((u) => (u.id === user.id ? user : u)))
      return user
    } catch (error) {
      console.error("Error updating user:", error)
      // Fallback to localStorage
      updateUser(user)
      setUsers(users.map((u) => (u.id === user.id ? user : u)))
      return user
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      if (isOnline) {
        // Delete from Firebase
        await deleteUserFromFirebase(id)
      }

      // Always delete from localStorage
      deleteUser(id)

      // Update state
      setUsers(users.filter((user) => user.id !== id))
    } catch (error) {
      console.error("Error deleting user:", error)
      // Fallback to localStorage
      deleteUser(id)
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  const handleAddExpense = async (expense: Omit<Expense, "id" | "userName" | "createdAt">) => {
    try {
      const user = users.find((u) => u.id === expense.userId)
      let newExpense: Expense

      if (isOnline) {
        // Add to Firebase
        newExpense = await createExpense({
          ...expense,
          userName: user?.name || "Unknown User",
        })
      } else {
        // Add to localStorage only
        newExpense = addExpense(expense)
      }

      // Update state
      setExpenses([...expenses, newExpense])
      return newExpense
    } catch (error) {
      console.error("Error adding expense:", error)
      // Fallback to localStorage
      const newExpense = addExpense(expense)
      setExpenses([...expenses, newExpense])
      return newExpense
    }
  }

  const handleUpdateExpense = async (expense: Expense) => {
    try {
      if (isOnline) {
        // Update in Firebase
        await updateExpenseInFirebase(expense)
      }

      // Always update in localStorage
      updateExpense(expense)

      // Update state
      setExpenses(expenses.map((e) => (e.id === expense.id ? expense : e)))
      return expense
    } catch (error) {
      console.error("Error updating expense:", error)
      // Fallback to localStorage
      updateExpense(expense)
      setExpenses(expenses.map((e) => (e.id === expense.id ? expense : e)))
      return expense
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      if (isOnline) {
        // Delete from Firebase
        await deleteExpenseFromFirebase(id)
      }

      // Always delete from localStorage
      deleteExpense(id)

      // Update state
      setExpenses(expenses.filter((expense) => expense.id !== id))
    } catch (error) {
      console.error("Error deleting expense:", error)
      // Fallback to localStorage
      deleteExpense(id)
      setExpenses(expenses.filter((expense) => expense.id !== id))
    }
  }

  return (
    <StorageContext.Provider
      value={{
        users,
        expenses,
        addUser: handleAddUser,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
        addExpense: handleAddExpense,
        updateExpense: handleUpdateExpense,
        deleteExpense: handleDeleteExpense,
        loading,
        syncStatus,
        syncNow: syncWithFirebase,
        isOnline,
      }}
    >
      {children}
    </StorageContext.Provider>
  )
}

export function useStorage() {
  const context = useContext(StorageContext)
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider")
  }
  return context
}

