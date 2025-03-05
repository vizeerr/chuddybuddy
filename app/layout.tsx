import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/sidebar-provider"
import { StorageProvider } from "@/components/storage-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNav } from "@/components/mobile-nav"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "Chuddy Buddy",
//   description: "Track and manage your expenses",
//   manifest: "/manifest.json",
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "white" },
//     { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
//   ],
//   viewport: "width=device-width, initial-scale=1, maximum-scale=1",
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "default",
//     title: "Chuddy Buddy",
//   },
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="expense-theme">
          <StorageProvider>
            <SidebarProvider>
              <div className="flex min-h-screen flex-col">
                <MobileNav />
                <main className="flex-1">{children}</main>
              </div>
            </SidebarProvider>
            <Toaster />
          </StorageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

