import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ExpenseSummaryProps {
  title: string
  amount: number
  change?: string
  label?: string
}

export function ExpenseSummary({ title, amount, change, label }: ExpenseSummaryProps) {
  const isPositive = change?.startsWith("+")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
        {change ? (
          <p className="mt-1 flex items-center text-xs">
            {isPositive ? (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-red-500" />
            ) : (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-green-500" />
            )}
            <span className={isPositive ? "text-red-500" : "text-green-500"}>{change}</span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </p>
        ) : label ? (
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

