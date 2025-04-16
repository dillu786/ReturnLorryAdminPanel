"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function CompanyCommissionPage() {
  const [commission, setCommission] = useState("10")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchCommission = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/settings/company-commission')
        const data = await response.json()
        setCommission(data.commission.toString())
      } catch (error) {
        toast.error("Failed to load company commission")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommission()
  }, [])

  const handleSave = async () => {
    const commissionValue = parseFloat(commission)
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast.error("Please enter a valid commission percentage between 0 and 100")
      return
    }

    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/settings/company-commission', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commission: commissionValue }),
      })

      if (!response.ok) {
        throw new Error('Failed to update commission')
      }

      toast.success("Company commission updated successfully")
    } catch (error) {
      toast.error("Failed to update company commission")
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
        <h3 className="text-lg font-medium">Company Commission</h3>
        <p className="text-sm text-muted-foreground">
          Manage the commission percentage that your company takes from each transaction.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Commission Settings</CardTitle>
          <CardDescription>
            Set the percentage of commission your company will receive from each transaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commission">Commission Percentage</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-32"
                disabled={isSaving}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
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