"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Edit, Trash2, DollarSign } from "lucide-react"
import { useStorage } from "@/components/storage-provider"
import { useRouter } from "next/navigation"
import { formatCurrency, getInitials } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export function UserList() {
  const { users, expenses, deleteUser, loading } = useStorage()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  // Calculate total expenses for each user
  const userExpenses = users.map((user) => {
    const userExpenseList = expenses.filter((expense) => expense.userId === user.id)
    const totalExpenses = userExpenseList.reduce((sum, expense) => sum + expense.amount, 0)
    const expenseCount = userExpenseList.length

    return {
      ...user,
      totalExpenses,
      expenseCount,
    }
  })

  const filteredUsers = userExpenses.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (id: string) => {
    router.push(`/users/edit/${id}`)
  }

  const handleViewExpenses = (id: string, name: string) => {
    router.push(`/expenses?userId=${id}`)
    toast({
      title: `Viewing ${name}'s expenses`,
      description: "Filtered expenses by user",
    })
  }

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        // Check if user has expenses
        const userHasExpenses = expenses.some((expense) => expense.userId === userToDelete)

        if (userHasExpenses) {
          toast({
            title: "Cannot delete user",
            description:
              "This user has associated expenses. Delete the expenses first or reassign them to another user.",
            variant: "destructive",
          })
        } else {
          await deleteUser(userToDelete)
          toast({
            title: "User deleted",
            description: "The user has been successfully deleted.",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        })
      }
      setUserToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="overflow-hidden">
          {filteredUsers.length > 0 ? (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium capitalize">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.phone && <div className="text-xs text-muted-foreground">{user.phone}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(user.totalExpenses)}</div>
                      <div className="text-sm text-muted-foreground">{user.expenseCount} expenses</div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewExpenses(user.id, user.name)}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          View Expenses
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setUserToDelete(user.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">No users found</div>
          )}
        </Card>
      </div>

      <AlertDialog open={userToDelete !== null} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

