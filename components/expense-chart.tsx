"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useStorage } from "@/components/storage-provider"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface ChartData {
  name: string
  amount: number
}

export function ExpenseChart() {
  const { expenses } = useStorage()
  const { theme } = useTheme()
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([])
  const [weeklyData, setWeeklyData] = useState<ChartData[]>([])
  const [chartColors, setChartColors] = useState({
    stroke: "#8884d8",
    fill: "#8884d8",
    grid: "#e0e0e0",
    text: "#333333",
  })

  // Update chart colors based on theme
  useEffect(() => {
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setChartColors({
        stroke: "#a78bfa",
        fill: "#7c3aed",
        grid: "#374151",
        text: "#e5e7eb",
      })
    } else {
      setChartColors({
        stroke: "#8884d8",
        fill: "#8884d8",
        grid: "#e0e0e0",
        text: "#333333",
      })
    }
  }, [theme])

  useEffect(() => {
    if (expenses.length === 0) return

    // Process monthly data
    const monthMap = new Map<string, number>()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const currentAmount = monthMap.get(monthKey) || 0
      monthMap.set(monthKey, currentAmount + expense.amount)
    })

    const sortedMonthlyData = Array.from(monthMap.entries())
      .sort((a, b) => {
        const [yearA, monthA] = a[0].split("-").map(Number)
        const [yearB, monthB] = b[0].split("-").map(Number)
        return yearA !== yearB ? yearA - yearB : monthA - monthB
      })
      .slice(-6) // Last 6 months
      .map(([key, amount]) => {
        const [, month] = key.split("-").map(Number)
        return {
          name: monthNames[month],
          amount,
        }
      })

    setMonthlyData(sortedMonthlyData)

    // Process weekly data
    const weekMap = new Map<string, number>()
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Get expenses from the last 7 days
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    expenses
      .filter((expense) => new Date(expense.date) >= oneWeekAgo)
      .forEach((expense) => {
        const date = new Date(expense.date)
        const dayKey = date.getDay().toString()
        const currentAmount = weekMap.get(dayKey) || 0
        weekMap.set(dayKey, currentAmount + expense.amount)
      })

    const weeklyDataArray = Array.from({ length: 7 }, (_, i) => {
      return {
        name: dayNames[i],
        amount: weekMap.get(i.toString()) || 0,
      }
    })

    setWeeklyData(weeklyDataArray)
  }, [expenses])

  return (
    <Card className="transition-colors">
      <CardHeader>
        <CardTitle>Expense Trends</CardTitle>
        <CardDescription>View your spending patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="mb-4">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Amount"]}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    color: chartColors.text,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={chartColors.stroke}
                  fill={chartColors.fill}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Amount"]}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    color: chartColors.text,
                  }}
                />
                <Bar dataKey="amount" fill={chartColors.fill} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

