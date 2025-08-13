"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown, Users, Car, DollarSign, Activity } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { CACHE_KEYS } from "@/lib/cache-utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalRides: number
  activeRides: number
  completedRides: number
  cancelledRides: number
  totalDrivers: number
  totalOwners: number
  totalRevenue: number
  totalCustomers: number
  rideGrowth: number
  revenueGrowth: number
  driverGrowth: number
  customerGrowth: number
}

interface RecentActivity {
  id: string
  type: 'ride_completed' | 'ride_started' | 'ride_placed' | 'ride_cancelled' | 'driver_joined' | 'owner_registered'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'warning' | 'error' | 'info'
}

export default function DashboardPage() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: [CACHE_KEYS.DASHBOARD_STATS],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: [CACHE_KEYS.RECENT_ACTIVITIES],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/activities')
      if (!response.ok) {
        throw new Error('Failed to fetch recent activities')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Fetch drivers count
  const { data: driversData } = useQuery({
    queryKey: [CACHE_KEYS.DRIVERS, 'count'],
    queryFn: async () => {
      const response = await fetch('/api/drivers?page=1&pageSize=1')
      if (!response.ok) {
        throw new Error('Failed to fetch drivers count')
      }
      const data = await response.json()
      return data.pagination?.total || 0
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch owners count
  const { data: ownersData } = useQuery({
    queryKey: [CACHE_KEYS.OWNERS, 'count'],
    queryFn: async () => {
      const response = await fetch('/api/owners?page=1&pageSize=1')
      if (!response.ok) {
        throw new Error('Failed to fetch owners count')
      }
      const data = await response.json()
      return data.pagination?.total || 0
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ride_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ride_started':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'ride_placed':
        return <ClipboardList className="h-4 w-4 text-yellow-500" />
      case 'ride_cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'driver_joined':
        return <Users className="h-4 w-4 text-green-500" />
      case 'owner_registered':
        return <Car className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBgColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'error':
        return 'bg-red-100'
      case 'info':
        return 'bg-blue-100'
      default:
        return 'bg-gray-100'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  if (statsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatNumber(stats.totalRides) : '0'}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.rideGrowth && stats.rideGrowth > 0 ? (
                    <>
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">+{stats.rideGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">{stats?.rideGrowth || 0}%</span>
                    </>
                  )}
                  <span className="ml-1">from yesterday</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatNumber(stats.activeRides) : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? formatCurrency(stats.totalRevenue) : '₹0'}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.revenueGrowth && stats.revenueGrowth > 0 ? (
                    <>
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">+{stats.revenueGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">{stats?.revenueGrowth || 0}%</span>
                    </>
                  )}
                  <span className="ml-1">from yesterday</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {driversData ? formatNumber(driversData) : '0'}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stats?.driverGrowth && stats.driverGrowth > 0 ? (
                    <>
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">+{stats.driverGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">{stats?.driverGrowth || 0}%</span>
                    </>
                  )}
                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats ? formatNumber(stats.completedRides) : '0'}
                      </div>
                      <div className="text-sm text-blue-600">Completed Rides</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {ownersData ? formatNumber(ownersData) : '0'}
                      </div>
                      <div className="text-sm text-green-600">Total Owners</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {stats ? formatNumber(stats.cancelledRides) : '0'}
                      </div>
                      <div className="text-sm text-red-600">Cancelled Rides</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats ? formatNumber(stats.totalCustomers) : '0'}
                      </div>
                      <div className="text-sm text-purple-600">Total Customers</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities && activities.length > 0 ? (
                      activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-full ${getActivityBgColor(activity.status)} flex items-center justify-center`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activities</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ride Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {stats && stats.totalRides > 0 
                      ? Math.round((stats.completedRides / stats.totalRides) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats?.completedRides || 0} out of {stats?.totalRides || 0} rides completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Revenue per Ride</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {stats && stats.totalRides > 0 
                      ? formatCurrency(Math.round(stats.totalRevenue / stats.totalRides))
                      : '₹0'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total revenue divided by total rides
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{driversData || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Drivers</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{ownersData || 0}</div>
                  <div className="text-sm text-muted-foreground">Vehicle Owners</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Customers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
