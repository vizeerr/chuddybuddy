import { UserList } from "@/components/user-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Link href="/users/add">
          <Button size="sm" className="h-9">
            <Plus className="mr-1 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>
      <div className="mt-6">
        <UserList />
      </div>
    </div>
  )
}

