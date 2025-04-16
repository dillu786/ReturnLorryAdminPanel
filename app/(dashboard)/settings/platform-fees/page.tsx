"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PlatformFee {
  id: string
  name: string
  amount: number
  type: 'percentage' | 'fixed'
}

export default function PlatformFeesPage() {
  const [fees, setFees] = useState<PlatformFee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchFees = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/settings/platform-fees')
        const data = await response.json()
        setFees(data.fees)
      } catch (error) {
        toast.error("Failed to load platform fees")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFees()
  }, [])

  const handleFeeChange = (id: string, field: keyof PlatformFee, value: string | number) => {
    setFees(prevFees => 
      prevFees.map(fee => 
        fee.id === id ? { ...fee, [field]: value } : fee
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/settings/platform-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fees }),
      })

      if (!response.ok) {
        throw new Error('Failed to update platform fees')
      }

      toast.success("Platform fees updated successfully")
    } catch (error) {
      toast.error("Failed to update platform fees")
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
        <h3 className="text-lg font-medium">Platform Fees</h3>
        <p className="text-sm text-muted-foreground">
          Manage the fees charged by the platform for different services.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fee Settings</CardTitle>
          <CardDescription>
            Configure the fees charged for different platform services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {fees.map((fee) => (
            <div key={fee.id} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`fee-name-${fee.id}`}>Fee Name</Label>
                <Input
                  id={`fee-name-${fee.id}`}
                  value={fee.name}
                  onChange={(e) => handleFeeChange(fee.id, 'name', e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`fee-amount-${fee.id}`}>Amount</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={`fee-amount-${fee.id}`}
                    type="number"
                    min="0"
                    step={fee.type === 'percentage' ? "0.01" : "1"}
                    value={fee.amount}
                    onChange={(e) => handleFeeChange(fee.id, 'amount', parseFloat(e.target.value))}
                    className="w-32"
                    disabled={isSaving}
                  />
                  <span className="text-sm text-muted-foreground">
                    {fee.type === 'percentage' ? '%' : 'USD'}
                  </span>
                </div>
              </div>
            </div>
          ))}
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