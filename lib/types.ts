import type React from "react"
export interface User {
  id: string
  name: string
  email: string
  phone?: string
}

export interface Expense {
  id: string
  title: string
  description: string
  amount: number
  category: string
  userId: string
  userName: string
  date: string
  time: string
  createdAt: string
}

export type ExpenseFormData = Omit<Expense, "id" | "userName" | "createdAt">

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

export type Theme = "dark" | "light" | "system"

