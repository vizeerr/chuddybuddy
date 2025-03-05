"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useStorage } from "@/components/storage-provider"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface UserExpenseData {
  name: string
  total: number
  count: number
}

export function UserExpenseSummary() {
  const { users, expenses } = useStorage()
  const { theme } = useTheme()
  const [userExpenses, setUserExpenses] = useState<UserExpenseData[]>([])
  const [chartColors, setChartColors] = useState({
    bar: "#8884d8",
    grid: "#e0e0e0",
    text: "#333333",
  })

  // Update chart colors based on theme
  useEffect(() => {
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setChartColors({
        bar: "#a78bfa",
        grid: "#374151",
        text: "#e5e7eb",
      })
    } else {
      setChartColors({
        bar: "#8884d8",
        grid: "#e0e0e0",
        text: "#333333",
      })
    }
  }, [theme])

  useEffect(() => {
    if (users.length === 0 || expenses.length === 0) return

    // Calculate total expenses and count for each user
    const userMap = new Map<string, { name: string; total: number; count: number }>()

    // Initialize with all users (even those with no expenses)
    users.forEach((user) => {
      userMap.set(user.id, { name: user.name, total: 0, count: 0 })
    })

    // Add expense data
    expenses.forEach((expense) => {
      const userData = userMap.get(expense.userId)
      if (userData) {
        userMap.set(expense.userId, {
          name: userData.name,
          total: userData.total + expense.amount,
          count: userData.count + 1,
        })
      }
    })

    // Convert to array and sort by total (highest first)
    const userExpenseData = Array.from(userMap.values())
      .sort((a, b) => b.total - a.total)
      .filter((user) => user.count > 0) // Only show users with expenses

    setUserExpenses(userExpenseData)
  }, [users, expenses])

  return (
    <Card className="transition-colors">
      <CardHeader>
        <CardTitle>Expenses by User</CardTitle>
        <CardDescription>Total spending per user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {userExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userExpenses} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis type="number" stroke={chartColors.text} tickFormatter={(value) => formatCurrency(value)} />
                <YAxis type="category" dataKey="name" stroke={chartColors.text} width={70} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Total"]}
                  labelFormatter={(label) => `User: ${label}`}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    color: chartColors.text,
                  }}
                />
                <Bar dataKey="total" fill={chartColors.bar} radius={[0, 4, 4, 0]} name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No expense data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

