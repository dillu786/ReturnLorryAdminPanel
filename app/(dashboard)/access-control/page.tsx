"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Eye, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { StatusToggleButton } from "@/components/ui/status-toggle-button"
import { useStatusToggle } from "@/hooks/use-status-toggle"
import { toast } from "@/components/ui/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CACHE_KEYS } from "@/lib/cache-utils"

interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  _count: {
    role_permissions: number;
  };
}

export default function AccessControlPage() {
  const queryClient = useQueryClient();
  
  // Use the universal status toggle hook
  const { toggleStatus: toggleRoleStatus } = useStatusToggle({
    entityType: 'role',
    cacheKey: CACHE_KEYS.ROLES,
    apiEndpoint: '/api/roles/toggle-status'
  });
  
  const { data: roles = [] } = useQuery({
    queryKey: [CACHE_KEYS.ROLES],
    queryFn: async () => {
      const response = await fetch('/api/roles')
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }
      return response.json()
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Access Control</h2>
        <Link href="/access-control/new-role">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search roles..." className="w-full pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="hidden md:table-cell">Users</TableHead>
                <TableHead className="hidden md:table-cell">Permissions</TableHead>
                <TableHead className="hidden md:table-cell">System Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role: Role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{role.description}</TableCell>
                  <TableCell className="hidden md:table-cell">0</TableCell>
                  <TableCell className="hidden md:table-cell">{role._count.role_permissions}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {role.isSystemRole ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/access-control/view/${role.id}`}>
                        <Button variant="ghost" size="icon" title="View Role">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      <Link href={`/access-control/edit/${role.id}`}>
                        <Button variant="ghost" size="icon" title="Edit Role">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      {!role.isSystemRole && (
                        <StatusToggleButton
                          entityId={role.id}
                          entityName={role.name}
                          entityType="role"
                          isActive={true}
                          onToggle={toggleRoleStatus}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
