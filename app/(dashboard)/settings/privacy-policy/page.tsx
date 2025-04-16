"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/settings/privacy-policy')
        const data = await response.json()
        setContent(data.content)
      } catch (error) {
        toast.error("Failed to load privacy policy")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrivacyPolicy()
  }, [])

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Privacy policy content cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/settings/privacy-policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to update privacy policy')
      }

      toast.success("Privacy policy updated successfully")
    } catch (error) {
      toast.error("Failed to update privacy policy")
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
        <h3 className="text-lg font-medium">Privacy Policy</h3>
        <p className="text-sm text-muted-foreground">
          Manage your platform's privacy policy content.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy Content</CardTitle>
          <CardDescription>
            Update the privacy policy that will be displayed to your users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Policy Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono"
              disabled={isSaving}
              placeholder="Enter your privacy policy content here..."
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