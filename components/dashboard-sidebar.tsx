"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Car, UserCog, ShieldCheck, FileText, X } from "lucide-react"
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
      permission: "settings:access_control",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/documents",
      active: pathname === "/documents",
      permission: "documents:view",
    }, {
      label: "Settings",
      icon: FileText,
      href: "/settings",
      active: pathname === "/settings",
      permission: "settings:view",
    },
  ]

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex h-16 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Return Lorry Admin</h2>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="px-3 py-2">
              <nav className="flex flex-col gap-1">
                {routes.map((route) => (
                  <Protected key={route.href} requiredPermission={route.permission}>
                    <Link
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.label}
                    </Link>
                  </Protected>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-white md:flex">
        <div className="flex h-16 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Return Lorry Admin</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3 py-2">
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <Protected key={route.href} requiredPermission={route.permission}>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                </Protected>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
