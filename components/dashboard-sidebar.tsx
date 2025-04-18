"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Car, UserCog, ShieldCheck, FileText, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Protected } from "@/components/protected"

interface DashboardSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
      permission: "dashboard:view",
    },
    {
      label: "Rides",
      icon: Car,
      href: "/rides",
      active: pathname === "/rides",
      permission: "rides:view",
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      active: pathname === "/users",
      permission: "users:view",
    },
    {
      label: "Drivers",
      icon: Car,
      href: "/drivers",
      active: pathname === "/drivers",
      permission: "drivers:view",
    },
    {
      label: "Owners",
      icon: UserCog,
      href: "/owners",
      active: pathname === "/owners",
      permission: "owners:view",
    },
    {
      label: "Access Control",
      icon: ShieldCheck,
      href: "/access-control",
      active: pathname === "/access-control",
      permission: "access_control:view",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/documents",
      active: pathname === "/documents",
      permission: "documents:view",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
      permission: "settings:view",
    },
  ]

  const SidebarContent = () => (
    <ScrollArea className="h-full py-6">
      <div className="px-3 py-2">
        <nav className="flex flex-col gap-1">
          {routes.map((route) => (
            <Protected key={route.href} requiredPermission={route.permission}>
              <Link
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  route.active
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

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex h-16 items-center border-b px-4">
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarContent />
      </aside>
    </>
  )
}
