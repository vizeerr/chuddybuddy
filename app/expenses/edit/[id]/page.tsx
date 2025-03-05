"use client"

import { useEffect, useState } from "react"
import { AddExpenseForm } from "@/components/add-expense-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useStorage } from "@/components/storage-provider"
import { useParams, useRouter } from "next/navigation"
import type { Expense } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditExpensePage() {
  const { expenses } = useStorage()
  const params = useParams()
  const router = useRouter()
  const [expense, setExpense] = useState<Expense | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) {
      router.push("/expenses")
      return
    }

    const id = params.id as string
    const foundExpense = expenses.find((e) => e.id === id)

    if (!foundExpense) {
      router.push("/expenses")
      return
    }

    setExpense(foundExpense)
    setLoading(false)
  }, [expenses, params.id, router])

  if (loading) {
    return (
      <div className="container px-4 py-6 md:py-10">
        <div className="mb-6">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="mx-auto max-w-md">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="mb-6">
        <Link href="/expenses">
          <Button variant="ghost" size="sm" className="h-9">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Expenses
          </Button>
        </Link>
      </div>
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit Expense</h1>
        {expense && <AddExpenseForm expenseToEdit={expense} />}
      </div>
    </div>
  )
}

