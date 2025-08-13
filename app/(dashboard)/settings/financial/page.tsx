"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Save, CreditCard, DollarSign, TrendingUp, Settings, AlertCircle, CheckCircle } from "lucide-react"

export default function FinancialSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Payment Settings
    paymentMethods: {
      creditCard: true,
      bankTransfer: true,
      digitalWallet: true,
      cash: false
    },
    autoPayment: false,
    paymentReminders: true,
    
    // Commission Settings
    driverCommission: 15,
    ownerCommission: 10,
    platformFee: 5,
    
    // Billing Settings
    billingCycle: "monthly",
    taxRate: 18,
    currency: "INR",
    
    // Payout Settings
    minimumPayout: 500,
    payoutSchedule: "weekly",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      accountHolder: "",
      bankName: ""
    }
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Settings Saved",
        description: "Financial settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [field]: value
        }
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Settings</h2>
          <p className="text-muted-foreground">
            Manage payment methods, commissions, and billing preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="commissions">
            <DollarSign className="mr-2 h-4 w-4" />
            Commissions
          </TabsTrigger>
          <TabsTrigger value="billing">
            <TrendingUp className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Settings className="mr-2 h-4 w-4" />
            Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure accepted payment methods and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Credit/Debit Cards</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via credit and debit cards
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.creditCard}
                    onCheckedChange={(checked) => 
                      handleInputChange("paymentMethods", "creditCard", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bank Transfer</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept direct bank transfers
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.bankTransfer}
                    onCheckedChange={(checked) => 
                      handleInputChange("paymentMethods", "bankTransfer", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Digital Wallets</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept payments via UPI, Paytm, etc.
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.digitalWallet}
                    onCheckedChange={(checked) => 
                      handleInputChange("paymentMethods", "digitalWallet", checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cash Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow cash payments for rides
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentMethods.cash}
                    onCheckedChange={(checked) => 
                      handleInputChange("paymentMethods", "cash", checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Payment</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically process payments when due
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoPayment}
                    onCheckedChange={(checked) => 
                      handleInputChange("", "autoPayment", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminders for pending payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) => 
                      handleInputChange("", "paymentReminders", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
              <CardDescription>
                Set commission rates for drivers and owners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="driverCommission">Driver Commission (%)</Label>
                  <Input
                    id="driverCommission"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.driverCommission}
                    onChange={(e) => 
                      handleInputChange("", "driverCommission", parseFloat(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage of fare that goes to drivers
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerCommission">Owner Commission (%)</Label>
                  <Input
                    id="ownerCommission"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.ownerCommission}
                    onChange={(e) => 
                      handleInputChange("", "ownerCommission", parseFloat(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Percentage of fare that goes to vehicle owners
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee (%)</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.platformFee}
                    onChange={(e) => 
                      handleInputChange("", "platformFee", parseFloat(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Platform's share of the fare
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Commission Summary</span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Driver Commission:</span>
                    <Badge variant="secondary">{settings.driverCommission}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner Commission:</span>
                    <Badge variant="secondary">{settings.ownerCommission}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    <Badge variant="secondary">{settings.platformFee}%</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <Badge variant={settings.driverCommission + settings.ownerCommission + settings.platformFee === 100 ? "default" : "destructive"}>
                      {settings.driverCommission + settings.ownerCommission + settings.platformFee}%
                    </Badge>
                  </div>
                  {settings.driverCommission + settings.ownerCommission + settings.platformFee !== 100 && (
                    <p className="text-xs text-red-600">
                      Total should equal 100%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
              <CardDescription>
                Configure billing cycles, taxes, and currency settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={settings.billingCycle}
                    onValueChange={(value) => 
                      handleInputChange("", "billingCycle", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => 
                      handleInputChange("", "currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => 
                    handleInputChange("", "taxRate", parseFloat(e.target.value))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  GST/VAT rate applied to transactions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>
                Configure payout schedules and bank account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minimumPayout">Minimum Payout Amount</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    min="0"
                    value={settings.minimumPayout}
                    onChange={(e) => 
                      handleInputChange("", "minimumPayout", parseFloat(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum amount required for payout
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                  <Select
                    value={settings.payoutSchedule}
                    onValueChange={(value) => 
                      handleInputChange("", "payoutSchedule", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Bank Account Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      value={settings.bankDetails.accountHolder}
                      onChange={(e) => 
                        handleNestedChange("bankDetails", "", "accountHolder", e.target.value)
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={settings.bankDetails.bankName}
                      onChange={(e) => 
                        handleNestedChange("bankDetails", "", "bankName", e.target.value)
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={settings.bankDetails.accountNumber}
                      onChange={(e) => 
                        handleNestedChange("bankDetails", "", "accountNumber", e.target.value)
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={settings.bankDetails.ifscCode}
                      onChange={(e) => 
                        handleNestedChange("bankDetails", "", "ifscCode", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Payout Status</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Payouts are currently active and will be processed according to your schedule.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 