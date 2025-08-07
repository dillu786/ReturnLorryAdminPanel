"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Plus, Search, Filter, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, User, Shield, ShieldOff, Ban, Save, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/hooks/use-permissions"
import { useMemo, useCallback, useState } from "react"
import { CACHE_KEYS } from "@/lib/cache-utils"
import { useCacheInvalidation } from "@/hooks/use-cache-invalidation"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function UsersPage() {
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: '',
    Email: '',
    MobileNumber: '',
    DOB: '',
    Gender: 'MALE'
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const pageSize = 10;
  
  // Memoize permission checks
  const permissions = useMemo(() => ({
    view: hasPermission("users:view"),
    edit: hasPermission("users:edit"),
    delete: hasPermission("users:delete"),
    export: hasPermission("users:export"),
    create: hasPermission("users:create"),
  }), [hasPermission]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(status && { status })
      });

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: [CACHE_KEYS.USERS, page, search, status],
    queryFn: fetchUsers
  });

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, pageSize, totalPages: 0 };

  // Fetch user details when selected
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [CACHE_KEYS.USER, selectedUser?.Id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await fetch(`/api/users/${selectedUser.Id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch user details");
      }
      return await response.json();
    },
    enabled: !!selectedUser,
  });

  // Cache invalidation and API helpers
  const queryClient = useQueryClient();
  const { invalidateUserCache, apiCallWithCacheInvalidation } = useCacheInvalidation();

  // Memoize action handlers
  const handleView = useCallback((user: any) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((user: any) => {
    setSelectedUser(user);
    setEditForm({
      Name: user.Name || '',
      Email: user.Email || '',
      MobileNumber: user.MobileNumber || '',
      DOB: user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '',
      Gender: user.Gender || 'MALE'
    });
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback(async (userId: string) => {
    setIsDeleting(userId);
    
    try {
      await apiCallWithCacheInvalidation(
        `/api/users/${userId}`,
        { method: 'DELETE' },
        () => invalidateUserCache(userId),
        "User deleted successfully!",
        "Failed to delete user"
      );
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('Cannot delete user with existing bookings')) {
        toast({
          title: "Cannot Delete User",
          description: "This user has existing bookings and cannot be deleted. Please deactivate the user instead.",
          variant: "destructive",
        });
      } else if (error.message?.includes('User not found')) {
        toast({
          title: "User Not Found",
          description: "The user you're trying to delete no longer exists.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: error.message || "An unexpected error occurred while deleting the user.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(null);
    }
  }, [apiCallWithCacheInvalidation, invalidateUserCache]);

  const handleStatusChange = useCallback(async (userId: string, newStatus: string) => {
    try {
      await apiCallWithCacheInvalidation(
        `/api/users/${userId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: newStatus })
        },
        () => invalidateUserCache(userId),
        `User ${newStatus === 'activate' ? 'activated' : newStatus === 'deactivate' ? 'deactivated' : 'blocked'} successfully!`,
        `Failed to ${newStatus} user`
      );
    } catch (error) {
      console.error('Status change error:', error);
    }
  }, [apiCallWithCacheInvalidation, invalidateUserCache]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  }, []);

  const handleFilterStatusChange = useCallback((value: string) => {
    setStatus(value === 'all' ? '' : value);
    setPage(1); // Reset to first page on new filter
  }, []);

  const handleSaveUser = useCallback(async () => {
    if (!selectedUser) return;
    
    // Basic validation
    if (!editForm.Name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!editForm.MobileNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Mobile number is required",
        variant: "destructive",
      });
      return;
    }
    
    // Mobile number validation (basic)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(editForm.MobileNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await apiCallWithCacheInvalidation(
        `/api/users/${selectedUser.Id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update',
            ...editForm,
            DOB: editForm.DOB ? new Date(editForm.DOB).toISOString() : null
          })
        },
        () => invalidateUserCache(selectedUser.Id),
        "User updated successfully!",
        "Failed to update user"
      );
      setIsEditOpen(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [apiCallWithCacheInvalidation, invalidateUserCache, selectedUser, editForm]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleResetPassword = useCallback(async () => {
    if (!selectedUser || !newPassword.trim()) return;
    
    setIsSaving(true);
    try {
      await apiCallWithCacheInvalidation(
        `/api/users/${selectedUser.Id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'reset-password',
            password: newPassword
          })
        },
        () => invalidateUserCache(selectedUser.Id),
        "Password reset successfully!",
        "Failed to reset password"
      );
      setShowResetPassword(false);
      setNewPassword('');
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [apiCallWithCacheInvalidation, invalidateUserCache, selectedUser, newPassword]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatus("");
    setPage(1);
  }, []);

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => (
    users.map((user) => (
      <TableRow key={user.Id}>
        <TableCell className="font-medium">{user.Name}</TableCell>
        <TableCell className="hidden md:table-cell">{user.Email}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge
            variant={
              user.status === 'active'
                ? "default"
                : user.status === 'blocked'
                ? "destructive"
                : "secondary"
            }
          >
            {user.status}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell">{user.rides}</TableCell>
        <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
        <TableCell className="text-right">
          {permissions.view && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleView(user)}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              {permissions.edit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      <User className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    {user.status !== 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(user.Id, 'activate')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    {user.status === 'active' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(user.Id, 'deactivate')}>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                    )}
                    {user.status !== 'blocked' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(user.Id, 'block')}>
                        <Ban className="h-4 w-4 mr-2" />
                        Block
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {permissions.delete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={isDeleting === user.Id}
                    >
                      {isDeleting === user.Id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action cannot be undone. This will permanently delete the user
                          <strong> "{user.Name}"</strong> and all their data.
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• User profile and account information</p>
                          <p>• All associated data and preferences</p>
                          {user.rides > 0 && (
                            <p className="text-amber-600 font-medium">
                              ⚠️ This user has {user.rides} ride(s) - deletion may be restricted
                            </p>
                          )}
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(user.Id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting === user.Id}
                      >
                        {isDeleting === user.Id ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Deleting...
                          </>
                        ) : (
                          'Delete User'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    ))
  ), [users, permissions, handleView, handleEdit, handleDelete, handleStatusChange, isDeleting]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search users..." 
                className="w-full pl-8"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter users by status
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Select value={status || 'all'} onValueChange={handleFilterStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(search || status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {permissions.export && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="py-12 text-center">Loading users...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">Error loading users</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Rides</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? tableRows : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of {pagination.total} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              {userData?.user?.Name}'s Details
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 pt-6">
            {isLoadingUser ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : userData?.user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm">{userData.user.Name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{userData.user.Email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                      <p className="text-sm">{userData.user.MobileNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant={userData.user.status === 'active' ? 'default' : 'secondary'}>
                        {userData.user.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Joined</label>
                      <p className="text-sm">{userData.user.joined}</p>
                    </div>
                  </div>
                </div>

                {/* Ride Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ride Statistics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Rides</label>
                      <p className="text-2xl font-bold">{userData.user.rides}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Spent</label>
                      <p className="text-2xl font-bold">₹{userData.user.totalSpent?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Ride</label>
                      <p className="text-sm">{userData.user.lastRide || 'No rides yet'}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                {userData.user.Bookings && userData.user.Bookings.length > 0 && (
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold">Recent Bookings</h3>
                    <div className="space-y-2">
                      {userData.user.Bookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.Id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {booking.PickupLocation} → {booking.DropLocation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.CreatedDateTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={booking.Status === 'completed' ? 'default' : 'secondary'}>
                              {booking.Status}
                            </Badge>
                            <p className="text-sm font-medium">₹{booking.TotalAmount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              Edit User: {selectedUser?.Name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 pt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={editForm.Name}
                      onChange={(e) => handleFormChange('Name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                      id="mobile"
                      value={editForm.MobileNumber}
                      onChange={(e) => handleFormChange('MobileNumber', e.target.value)}
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.Email}
                      onChange={(e) => handleFormChange('Email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={editForm.DOB}
                      onChange={(e) => handleFormChange('DOB', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={editForm.Gender} onValueChange={(value) => handleFormChange('Gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Current User Information */}
              {selectedUser && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Current Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                      <Badge variant={selectedUser.IsActive ? 'default' : 'secondary'} className="mt-1">
                        {selectedUser.IsActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                      <p className="text-sm mt-1">{new Date(selectedUser.CreatedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total Rides</Label>
                      <p className="text-sm mt-1">{selectedUser.rides || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                      <p className="text-sm mt-1">{new Date(selectedUser.LastLoggedIn).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Reset Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Security</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Password Reset</Label>
                      <p className="text-sm text-muted-foreground">
                        Reset the user's password to a new temporary password
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                    >
                      {showResetPassword ? 'Cancel' : 'Reset Password'}
                    </Button>
                  </div>
                  
                  {showResetPassword && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <Button
                        onClick={handleResetPassword}
                        disabled={isSaving || !newPassword.trim()}
                        size="sm"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Resetting...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              * Required fields
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUser}
                disabled={isSaving || !editForm.Name || !editForm.MobileNumber}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


