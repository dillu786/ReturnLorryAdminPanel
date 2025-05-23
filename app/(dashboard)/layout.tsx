"use client"

import { useState, useCallback, memo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Car, UserCog, ShieldCheck, FileText, Settings, X, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Protected } from "@/components/protected"
import { DashboardHeader } from "@/components/dashboard-header"

const MemoizedDashboardHeader = memo(DashboardHeader)

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: "dashboard:view",
  },
  {
    label: "Trips",
    icon: Car,
    href: "/rides",
    permission: "rides:view",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    permission: "users:view",
  },
  {
    label: "Drivers",
    icon: UserCheck,
    href: "/drivers",
    permission: "drivers:view",
  },
  {
    label: "Owners",
    icon: UserCog,
    href: "/owners",
    permission: "owners:view",
  },
  {
    label: "Access Control",
    icon: ShieldCheck,
    href: "/access-control",
    permission: "access_control:view",
  },

  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    permission: "settings:view",
  },
]

const SidebarContent = memo(function SidebarContent({ 
  pathname, 
  onClose 
}: { 
  pathname: string
  onClose?: () => void 
}) {
  return (
    <ScrollArea className="h-full py-6">
      <div className="px-3 py-2">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => (
            <Protected key={route.href} requiredPermission={route.permission}>
              <Link
                href={route.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === route.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            </Protected>
          ))}
        </nav>
      </div>
    </ScrollArea>
  )
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const handleSidebarToggle = useCallback((open: boolean) => {
    setSidebarOpen(open)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/95">
      <MemoizedDashboardHeader setSidebarOpen={handleSidebarToggle} />
      <div className="flex flex-1">
        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex h-16 items-center border-b px-4">
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <SidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarContent pathname={pathname} />
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
