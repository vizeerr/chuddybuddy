"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, IndianRupee, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSidebar } from "./sidebar-provider"
import { ThemeToggle } from "./theme-toggle"
import { SyncStatus } from "./sync-status"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Expenses", href: "/expenses", icon: IndianRupee },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar()

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background px-0 lg:px-6">
        <Sheet open={isOpen} onOpenChange={toggleSidebar}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[400px]">
            <div className="flex h-full flex-col">
              
              <nav className="flex-1 overflow-auto py-4">
                <ul className="grid gap-1 mt-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                          pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t p-4">
                <SyncStatus />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            
            <span>Chuddy Buddy</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className=" flex gap-2 items-center ">
              <div className="md:flex hidden">
                <SyncStatus/>
              </div>
              <ThemeToggle />
            </div>
            <nav className="hidden lg:flex">
              <ul className="flex gap-4">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}

