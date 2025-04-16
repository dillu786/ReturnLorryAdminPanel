"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  FileText,
  Shield,
  Percent,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"

interface MenuItem {
  title: string
  href: string
  icon: any
  children?: MenuItem[]
}

const sidebarNavItems: MenuItem[] = [
  {
    title: "Financial Settings",
    href: "/settings/financial",
    icon: CreditCard,
    children: [
      {
        title: "Company Commission",
        href: "/settings/company-commission",
        icon: Percent,
      },
      {
        title: "Platform Fees",
        href: "/settings/platform-fees",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Legal Documents",
    href: "/settings/legal",
    icon: FileText,
    children: [
      {
        title: "Privacy Policy",
        href: "/settings/privacy-policy",
        icon: Shield,
      },
      {
        title: "Terms & Conditions",
        href: "/settings/terms",
        icon: FileText,
      },
    ],
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Initialize expanded sections based on the current path
  useEffect(() => {
    const sections = new Set<string>()
    
    // If we're on a child page, expand its parent section
    if (pathname.includes('/settings/company-commission') || 
        pathname.includes('/settings/platform-fees')) {
      sections.add('financial')
    }
    
    if (pathname.includes('/settings/privacy-policy') || 
        pathname.includes('/settings/terms')) {
      sections.add('legal')
    }
    
    // If we're on a parent page, expand that section
    if (pathname === '/settings/financial') {
      sections.add('financial')
    }
    
    if (pathname === '/settings/legal') {
      sections.add('legal')
    }
    
    setExpandedSections(Array.from(sections))
  }, [pathname])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isSectionExpanded = (section: string) => expandedSections.includes(section)

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = pathname === item.href
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const section = item.href.split('/')[2] // Get section from href (e.g., 'financial' from '/settings/financial')
    const isChildActive = hasChildren && item.children!.some(child => pathname === child.href)

    return (
      <div key={item.href} className="space-y-1">
        <div className="flex items-center">
          {hasChildren ? (
            <Button
              variant={isChildActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                level === 0 && "font-semibold",
                isChildActive && "bg-muted font-medium"
              )}
              onClick={() => toggleSection(section)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
              {isSectionExpanded(section) ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Button>
          ) : (
            <Link href={item.href} className="w-full">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-muted font-medium"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          )}
        </div>
        {hasChildren && isSectionExpanded(section) && (
          <div className="ml-4 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container relative mx-auto flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <ScrollArea className="h-full py-6 pr-6 lg:py-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <nav className="grid items-start gap-2">
              {sidebarNavItems.map((item) => renderMenuItem(item))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
      <main className="flex w-full flex-col overflow-hidden">{children}</main>
    </div>
  )
} 