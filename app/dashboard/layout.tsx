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
    <div className="flex flex-col min-h-screen bg-gradient text-white font-poppins ramadan-pattern">
      {/* Desktop Navigation */}
      <header className="sticky top-0 z-10 border-b border-blue-800/30 backdrop-blur-md bg-black/50 ramadan-header">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent flex items-center"
            >
              <div className="mr-2 hidden md:flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full relative overflow-hidden">
                  <div className="absolute w-5 h-5 bg-slate-900 rounded-full -right-2 top-0.5"></div>
                </div>
              </div>
              Iftar Party Organizer
            </Link>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-blue-300">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[80%] bg-gradient-to-br from-slate-900 to-blue-950 border-blue-800/30 p-0"
                >
                  <SheetHeader className="border-b border-blue-800/30 p-4">
                    <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                      Iftar Party Organizer
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col py-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-base ${
                          isActive(item.path)
                            ? "bg-blue-800/30 text-blue-100"
                            : "text-blue-300 hover:bg-blue-950/50 hover:text-blue-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-base text-red-400 hover:bg-red-950/20"
                    >
                      <LogOut className="h-5 w-5" />
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-800/30 text-blue-100"
                      : "text-blue-300 hover:text-blue-100 hover:bg-blue-950/50"
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
                    className="ml-2 text-blue-300 hover:text-blue-100 hover:bg-blue-950/50"
                  >
                    <span className="sr-only md:not-sr-only md:mr-2">Account</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-slate-900 border-blue-800/30">
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 cursor-pointer">
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

      <main className="flex-1">{children}</main>

      <footer className="border-t border-blue-800/30 p-4 text-center text-sm text-slate-400">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Aftab Kabir. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
