"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, MoreHorizontal, Filter, FileText, Eye, CheckCircle, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { RoleBasedSection } from "@/components/role-based-section"
import { RoleBasedAction } from "@/components/role-based-action"

export default function DocumentsPage() {
  // Mock data for documents
  const documents = [
    {
      id: "1",
      name: "Driver License - John Smith",
      type: "Driver License",
      owner: "John Smith",
      status: "verified",
      uploaded: "Jan 15, 2023",
      expires: "Jan 15, 2028",
    },
    {
      id: "2",
      name: "Vehicle Registration - Toyota Camry",
      type: "Vehicle Registration",
      owner: "Robert Johnson",
      status: "pending",
      uploaded: "Feb 3, 2023",
      expires: "Feb 3, 2024",
    },
    {
      id: "3",
      name: "Insurance Certificate - Honda Civic",
      type: "Insurance",
      owner: "Sarah Williams",
      status: "verified",
      uploaded: "Mar 22, 2023",
      expires: "Mar 22, 2024",
    },
    {
      id: "4",
      name: "Driver License - Emily Davis",
      type: "Driver License",
      owner: "Emily Davis",
      status: "rejected",
      uploaded: "Apr 10, 2023",
      expires: "N/A",
    },
    {
      id: "5",
      name: "Vehicle Inspection - Ford Focus",
      type: "Inspection",
      owner: "Michael Brown",
      status: "expired",
      uploaded: "May 5, 2023",
      expires: "Nov 5, 2023",
    },
  ]

  return (
    <RoleBasedSection 
      requiredPermission="documents:view"
      title="Documents"
      description="Manage and verify all documents in the system"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <RoleBasedAction requiredPermission="documents:upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </RoleBasedAction>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-2 sm:max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search documents..." className="w-full pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
            <RoleBasedAction requiredPermission="documents:export" variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </RoleBasedAction>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{document.type}</TableCell>
                    <TableCell className="hidden md:table-cell">{document.owner}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={
                          document.status === "verified"
                            ? "default"
                            : document.status === "pending"
                              ? "secondary"
                              : document.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {document.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{document.expires}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <RoleBasedAction requiredPermission="documents:view" variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="documents:download" variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="documents:verify" variant="ghost" size="icon">
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Verify</span>
                        </RoleBasedAction>
                        <RoleBasedAction requiredPermission="documents:reject" variant="ghost" size="icon">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </RoleBasedAction>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </RoleBasedSection>
  )
}
