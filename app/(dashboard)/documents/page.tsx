"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Upload, Search, Filter, Eye, FileText, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback } from "react"

export default function DocumentsPage() {
  const { hasPermission } = usePermissions();
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("documents:view"),
    download: hasPermission("documents:download"),
    verify: hasPermission("documents:verify"),
    reject: hasPermission("documents:reject"),
    upload: hasPermission("documents:upload"),
    export: hasPermission("documents:export"),
  }), [hasPermission]);

  // Mock data for documents
  const documents = [
    {
      id: "1",
      name: "Driver's License",
      type: "Identification",
      status: "verified",
      uploadedBy: "John Smith",
      uploadedAt: "2024-02-15",
    },
    {
      id: "2",
      name: "Vehicle Registration",
      type: "Vehicle",
      status: "pending",
      uploadedBy: "Sarah Johnson",
      uploadedAt: "2024-02-14",
    },
    {
      id: "3",
      name: "Insurance Certificate",
      type: "Insurance",
      status: "rejected",
      uploadedBy: "Michael Brown",
      uploadedAt: "2024-02-13",
    },
    {
      id: "4",
      name: "Background Check",
      type: "Background",
      status: "verified",
      uploadedBy: "Emily Davis",
      uploadedAt: "2024-02-12",
    },
    {
      id: "5",
      name: "Vehicle Inspection",
      type: "Vehicle",
      status: "pending",
      uploadedBy: "David Wilson",
      uploadedAt: "2024-02-11",
    },
  ]

  // Memoize action handlers
  const handleView = useCallback((documentId: string) => {
    // Handle view action
    console.log("View document:", documentId);
  }, []);

  const handleDownload = useCallback((documentId: string) => {
    // Handle download action
    console.log("Download document:", documentId);
  }, []);

  const handleVerify = useCallback((documentId: string) => {
    // Handle verify action
    console.log("Verify document:", documentId);
  }, []);

  const handleReject = useCallback((documentId: string) => {
    // Handle reject action
    console.log("Reject document:", documentId);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    documents.map((document) => (
      <TableRow key={document.id}>
        <TableCell className="font-medium">{document.name}</TableCell>
        <TableCell className="hidden md:table-cell">{document.type}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              document.status === "verified"
                ? "default"
                : document.status === "pending"
                ? "secondary"
                : "destructive"
            }
          >
            {document.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{document.uploadedBy}</TableCell>
        <TableCell className="hidden md:table-cell">{document.uploadedAt}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(document.id)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.download && (
                <Button variant="ghost" size="icon" onClick={() => handleDownload(document.id)}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              )}
              {permissions.verify && document.status === "pending" && (
                <Button variant="ghost" size="icon" onClick={() => handleVerify(document.id)}>
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Verify</span>
                </Button>
              )}
              {permissions.reject && document.status === "pending" && (
                <Button variant="ghost" size="icon" onClick={() => handleReject(document.id)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Reject</span>
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [documents, permissions, handleView, handleDownload, handleVerify, handleReject]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        {permissions.upload && (
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
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
          {permissions.export && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
