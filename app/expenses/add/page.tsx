import { AddExpenseForm } from "@/components/add-expense-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddExpensePage() {
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
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Add New Expense</h1>
        <AddExpenseForm />
      </div>
    </div>
  )
}

