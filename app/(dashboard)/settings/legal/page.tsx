"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, FileText } from "lucide-react"

export default function LegalDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Legal Documents</h3>
        <p className="text-sm text-muted-foreground">
          Manage your platform's legal documents and policies.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Policy
            </CardTitle>
            <CardDescription>
              Update your platform's privacy policy to inform users about data collection and usage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/privacy-policy">Manage Privacy Policy</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Terms & Conditions
            </CardTitle>
            <CardDescription>
              Set the terms and conditions that users must agree to when using your platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/terms">Manage Terms</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 