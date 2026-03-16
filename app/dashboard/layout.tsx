"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronDown, DollarSign, Home, LogOut, Menu, Package, Settings, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import GlobalFinancialSummary from "@/components/global-financial-summary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated using cookies
    const isAuthenticated = document.cookie.includes("iftar_auth=true")
    if (!isAuthenticated) {
      router.push("/login")
    }

    // Add custom font
    document.documentElement.classList.add("font-poppins")
  }, [router])

  const handleLogout = () => {
    // Replace localStorage.removeItem with cookie removal
    document.cookie = "iftar_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/dashboard/participants", label: "Participants", icon: Users },
    { path: "/dashboard/products", label: "Products", icon: Package },
    { path: "/dashboard/finances", label: "Finances", icon: DollarSign },
    { path: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
      {/* Desktop Navigation */}
      <header className="header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2"
            >
              <span className="text-2xl">🌙</span>
              <span>Iftar Manager</span>
            </Link>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-neutral-600 dark:text-neutral-400">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[250px] bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 p-0"
                >
                  <SheetHeader className="border-b border-neutral-200 dark:border-neutral-700 p-4">
                    <SheetTitle className="text-neutral-900 dark:text-white">
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col py-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <DropdownMenuItem onClick={handleLogout} className="text-error cursor-pointer focus:text-error dark:focus:text-error">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </header>

      {/* Global Financial Summary */}
      <div className="container mx-auto px-4 pt-4">
        <GlobalFinancialSummary />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-neutral-200 dark:border-neutral-700 p-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Aftab Kabir. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
