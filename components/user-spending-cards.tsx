"use client"

import { useState, useEffect } from "react"
import { useStorage } from "@/components/storage-provider"
import { useTheme } from "@/components/theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, getInitials } from "@/lib/utils"
import { ArrowUp, ArrowDown, Dot } from "lucide-react"

interface UserSpendingData {
  id: string
  name: string
  email: string
  phone?: string
  total: number
  count: number
  percentage: number
  trend: number
}

export function UserSpendingCards() {
  const { users, expenses } = useStorage()
  const { theme } = useTheme()
  const [userSpendings, setUserSpendings] = useState<UserSpendingData[]>([])
  const [totalExpenses, setTotalExpenses] = useState(0)

  // Calculate user spending data
  useEffect(() => {
    if (users.length === 0 || expenses.length === 0) return

    // Calculate total expenses
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    setTotalExpenses(total)

    // Calculate spending for each user
    const userMap = new Map<
      string,
      {
        id: string
        name: string
        email: string
        phone?: string
        total: number
        count: number
        lastMonthTotal: number
      }
    >()

    // Initialize with user information
    users.forEach((user) => {
      userMap.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        total: 0,
        count: 0,
        lastMonthTotal: 0,
      })
    })

    // Get current and last month
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Calculate expenses for each user
    expenses.forEach((expense) => {
      const user = userMap.get(expense.userId)
      if (!user) return

      const expenseDate = new Date(expense.date)
      const isCurrentMonth = expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      const isLastMonth = expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear

      // Update total and count
      userMap.set(expense.userId, {
        ...user,
        total: user.total + expense.amount,
        count: user.count + 1,
        lastMonthTotal: isLastMonth ? user.lastMonthTotal + expense.amount : user.lastMonthTotal,
      })
    })

    // Convert to array, calculate percentages and trends
    const spendingData = Array.from(userMap.values())
      .map((user) => {
        const percentage = total > 0 ? (user.total / total) * 100 : 0
        const trend = user.lastMonthTotal > 0 ? ((user.total - user.lastMonthTotal) / user.lastMonthTotal) * 100 : 0

        return {
          ...user,
          percentage,
          trend,
        }
      })
      .filter((user) => user.total > 0) // Only include users with spending
      .sort((a, b) => b.total - a.total) // Sort by total spending (highest first)

    setUserSpendings(spendingData)
  }, [users, expenses])

  // No data message if no spending
  if (userSpendings.length === 0) {
    return null
  }

  // Card colors based on position
  const getGradientClass = (index: number): string => {
    const gradients = [
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800",
      "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800",
      "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200 dark:border-teal-800",
      "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <h3 className="text-lg font-medium">User Spending</h3>
        <p className="text-sm text-muted-foreground">
          Total Expenses: <span className="font-semibold">{formatCurrency(totalExpenses)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userSpendings.map((user, index) => (
          <Card key={user.id} className={`transition-all hover:shadow-md ${getGradientClass(index)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <CardDescription className="text-xs truncate max-w-[150px]">{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center text-xs font-medium">
                  {user.trend > 0 ? (
                    <ArrowUp className="h-3 w-3 text-red-500 mr-1" />
                  ) : user.trend < 0 ? (
                    <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <Dot className="h-3 w-3 text-muted-foreground mr-1" />
                  )}
                  <span
                    className={
                      user.trend > 0 ? "text-red-500" : user.trend < 0 ? "text-green-500" : "text-muted-foreground"
                    }
                  >
                    {user.trend !== 0 ? `${Math.abs(user.trend).toFixed(1)}%` : "N/A"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-semibold">{formatCurrency(user.total)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{user.count} expenses</span>
                  <span className="text-muted-foreground">{user.percentage.toFixed(1)}% of total</span>
                </div>
                <Progress value={user.percentage} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

