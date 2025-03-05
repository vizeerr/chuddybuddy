"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useStorage } from "@/components/storage-provider"
import { formatCurrency } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

interface CategoryData {
  name: string
  value: number
  color: string
}

const LIGHT_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F", "#FFBB28", "#FF8042"]
const DARK_COLORS = ["#a78bfa", "#4ade80", "#facc15", "#fb923c", "#38bdf8", "#2dd4bf", "#fbbf24", "#f87171"]

export function CategoryBreakdown() {
  const { expenses } = useStorage()
  const { theme } = useTheme()
  const [data, setData] = useState<CategoryData[]>([])
  const [colors, setColors] = useState(LIGHT_COLORS)

  // Update colors based on theme
  useEffect(() => {
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setColors(DARK_COLORS)
    } else {
      setColors(LIGHT_COLORS)
    }
  }, [theme])

  useEffect(() => {
    if (expenses.length === 0) return

    // Process category data
    const categoryMap = new Map<string, number>()

    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    const categoryData = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))

    setData(categoryData)
  }, [expenses, colors])

  return (
    <Card className="transition-colors">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Your spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Amount"]}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    color: theme === "dark" ? "#e5e7eb" : "#333333",
                  }}
                />
                <Legend />
              </PieChart>
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

