"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ExpenseSummary } from "@/components/expense-summary"
import { ExpenseChart } from "@/components/expense-chart"
import { RecentExpenses } from "@/components/recent-expenses"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { UserExpenseSummary } from "@/components/user-expense-summary"
import { UserSpendingCards } from "@/components/user-spending-cards"
import { useStorage } from "@/components/storage-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { expenses, loading, syncStatus, isOnline } = useStorage()
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [monthlyAverage, setMonthlyAverage] = useState(0)
  const [highestCategory, setHighestCategory] = useState({ name: "", amount: 0 })
  const [highestSpender, setHighestSpender] = useState({ name: "", amount: 0 })
  const [monthlyChange, setMonthlyChange] = useState("0%")

  useEffect(() => {
    if (loading || expenses.length === 0) return

    // Calculate total expenses
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)

    // Calculate monthly average
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const previousMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear
    })

    const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    setMonthlyAverage(currentMonthTotal)

    // Calculate monthly change percentage
    if (previousMonthTotal > 0) {
      const change = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      setMonthlyChange(`${change >= 0 ? "+" : ""}${change.toFixed(1)}%`)
    }

    // Find highest category
    const categoryMap = new Map<string, number>()
    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    let maxCategory = { name: "", amount: 0 }
    categoryMap.forEach((amount, name) => {
      if (amount > maxCategory.amount) {
        maxCategory = { name, amount }
      }
    })

    setHighestCategory(maxCategory)

    // Find highest spender
    const userMap = new Map<string, { name: string; amount: number }>()
    expenses.forEach((expense) => {
      const current = userMap.get(expense.userId) || { name: expense.userName, amount: 0 }
      userMap.set(expense.userId, {
        name: expense.userName,
        amount: current.amount + expense.amount,
      })
    })

    let maxSpender = { name: "", amount: 0 }
    userMap.forEach((user) => {
      if (user.amount > maxSpender.amount) {
        maxSpender = user
      }
    })

    setHighestSpender(maxSpender)
  }, [expenses, loading])

  if (loading) {
    return (
      <div className="container px-4 py-6 md:py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-[180px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <DashboardHeader />
        <Link href="/expenses/add">
          <Button size="sm" className="h-9">
            <Plus className="mr-1 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>

      {!isOnline && (
        <div className="mb-6 rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="flex items-center text-sm font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            You are currently offline. Changes will be saved locally and synced when you're back online.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ExpenseSummary title="Total Expenses" amount={totalExpenses} change={monthlyChange} />
        <ExpenseSummary title="Monthly Average" amount={monthlyAverage} change={monthlyChange} />
        <ExpenseSummary title="Highest Category" amount={highestCategory.amount} label={highestCategory.name} />
        <ExpenseSummary title="Highest Spender" amount={highestSpender.amount} label={highestSpender.name} />
      </div>

      <div className="mt-6">
        <UserSpendingCards />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ExpenseChart />
        <CategoryBreakdown />
      </div>
{/* 
      <div className="mt-6">
        <UserExpenseSummary />
      </div> */}

      <div className="mt-6">
        <RecentExpenses />
      </div>
    </div>
  )
}

