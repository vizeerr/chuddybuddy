import { ExpenseList } from "@/components/expense-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ExpensesPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <Link href="/expenses/add">
          <Button size="sm" className="h-9">
            <Plus className="mr-1 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        <ExpenseList />
      </div>
    </div>
  )
}

