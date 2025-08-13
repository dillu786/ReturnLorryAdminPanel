import { QueryClient } from '@tanstack/react-query';

// Cache key constants for consistent usage across the app
export const CACHE_KEYS = {
  // Drivers
  DRIVERS: 'drivers',
  DRIVER: 'driver',
  
  // Users
  USERS: 'users',
  USER: 'user',
  
  // Owners
  OWNERS: 'owners',
  OWNER: 'owner',
  
  // Rides
  RIDES: 'rides',
  RIDE: 'ride',
  
  // Documents
  DOCUMENTS: 'documents',
  
  // Permissions
  PERMISSIONS: 'permissions',
  ROLES: 'roles',
  
  // Dashboard
  DASHBOARD_STATS: 'dashboard-stats',
  RECENT_ACTIVITIES: 'recent-activities',
} as const;

// Cache invalidation utilities
export class CacheManager {
  constructor(private queryClient: QueryClient) {}

  // Invalidate all queries that start with a specific key
  invalidateQueriesStartingWith(key: string) {
    this.queryClient.invalidateQueries({
      queryKey: [key],
    });
  }

  // Invalidate specific entity queries
  invalidateDriverQueries(driverId?: string) {
    if (driverId) {
      // Invalidate specific driver and all drivers list
      this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DRIVER, driverId] });
    }
    // Invalidate all drivers queries (including paginated ones)
    this.queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.DRIVERS],
      exact: false 
    });
  }

  invalidateUserQueries(userId?: string) {
    if (userId) {
      this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.USER, userId] });
    }
    this.queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.USERS],
      exact: false 
    });
  }

  invalidateOwnerQueries(ownerId?: string) {
    if (ownerId) {
      this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.OWNER, ownerId] });
    }
    this.queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.OWNERS],
      exact: false 
    });
  }

  invalidateRideQueries(rideId?: string) {
    if (rideId) {
      this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.RIDE, rideId] });
    }
    this.queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.RIDES],
      exact: false 
    });
  }

  // Invalidate all related queries when a driver is updated
  invalidateDriverRelatedQueries(driverId?: string) {
    this.invalidateDriverQueries(driverId);
    // Also invalidate documents since they're related to drivers
    this.queryClient.invalidateQueries({ 
      queryKey: [CACHE_KEYS.DOCUMENTS],
      exact: false 
    });
  }

  // Invalidate all related queries when an owner is updated
  invalidateOwnerRelatedQueries(ownerId?: string) {
    this.invalidateOwnerQueries(ownerId);
    // Also invalidate documents since they're related to owners
    this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.DOCUMENTS] });
  }

  // Invalidate permissions and roles when they're updated
  invalidatePermissionQueries() {
    this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PERMISSIONS] });
    this.queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ROLES] });
  }

  // Invalidate all queries (use sparingly)
  invalidateAllQueries() {
    this.queryClient.invalidateQueries();
  }
}

// Hook to use cache manager
export const useCacheManager = (queryClient: QueryClient) => {
  return new CacheManager(queryClient);
}; 