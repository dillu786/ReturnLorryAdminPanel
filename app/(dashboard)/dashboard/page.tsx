
import { getCustomers } from "@/app/actions/role-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react"
import { getServerSession, Session } from "next-auth"
import { useSession } from "next-auth/react"



export default async function DashboardPage() {
  const session = await getServerSession();
  console.log("session"+session);
  const customers = await getCustomers();
  console.log(customers);
  if(session){

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
                  <CardTitle className="text-sm font-medium">Rides Placed</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">+12%</span> from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rides Active</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">+5%</span> from last hour
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rides Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium">+18%</span> from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rides Cancelled</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                    <span className="text-red-500 font-medium">-2%</span> from yesterday
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Ride Statistics</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
                  <p className="text-muted-foreground">Chart will be displayed here</p>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ride #R-1234 completed</p>
                        <p className="text-xs text-muted-foreground">10 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ride #R-1235 started</p>
                        <p className="text-xs text-muted-foreground">25 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ride #R-1236 placed</p>
                        <p className="text-xs text-muted-foreground">45 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ride #R-1237 cancelled</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Ride #R-1233 completed</p>
                        <p className="text-xs text-muted-foreground">1.5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Analytics content will be displayed here</p>
          </TabsContent>
          <TabsContent value="reports" className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Reports content will be displayed here</p>
          </TabsContent>
        </Tabs>
      </div>
      
    )
  }
}
