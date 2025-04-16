"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function TermsPage() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchTerms = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/settings/terms')
        const data = await response.json()
        setContent(data.content)
      } catch (error) {
        toast.error("Failed to load terms and conditions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTerms()
  }, [])

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Terms and conditions content cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/settings/terms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to update terms and conditions')
      }

      toast.success("Terms and conditions updated successfully")
    } catch (error) {
      toast.error("Failed to update terms and conditions")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Terms & Conditions</h3>
        <p className="text-sm text-muted-foreground">
          Manage your platform's terms and conditions content.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions Content</CardTitle>
          <CardDescription>
            Update the terms and conditions that will be displayed to your users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Terms Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono"
              disabled={isSaving}
              placeholder="Enter your terms and conditions content here..."
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 