import { useQueryClient } from '@tanstack/react-query';
import { useCacheManager, CACHE_KEYS } from '@/lib/cache-utils';
import { toast } from '@/components/ui/use-toast';

export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();
  const cacheManager = useCacheManager(queryClient);

  const invalidateDriverCache = (driverId?: string) => {
    console.log('Invalidating driver cache for:', driverId);
    cacheManager.invalidateDriverRelatedQueries(driverId);
    // Force refetch of the current drivers list
    queryClient.refetchQueries({ 
      queryKey: [CACHE_KEYS.DRIVERS],
      exact: false 
    });
    console.log('Cache invalidation completed');
  };

  const invalidateUserCache = (userId?: string) => {
    console.log('Invalidating user cache for:', userId);
    cacheManager.invalidateUserQueries(userId);
    // Force refetch of the current users list
    queryClient.refetchQueries({ 
      queryKey: [CACHE_KEYS.USERS],
      exact: false 
    });
    console.log('User cache invalidation completed');
  };

  const invalidateOwnerCache = (ownerId?: string) => {
    cacheManager.invalidateOwnerRelatedQueries(ownerId);
  };

  const invalidateRideCache = (rideId?: string) => {
    cacheManager.invalidateRideQueries(rideId);
  };

  const invalidatePermissionCache = () => {
    cacheManager.invalidatePermissionQueries();
  };

  const invalidateAllCache = () => {
    cacheManager.invalidateAllQueries();
  };

  // Helper function for API calls with automatic cache invalidation
  const apiCallWithCacheInvalidation = async (
    url: string,
    options: RequestInit,
    invalidateFunction: () => void,
    successMessage?: string,
    errorMessage?: string
  ) => {
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Invalidate cache
        invalidateFunction();
        
        // Show success message
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
        
        return result;
      } else {
        // Show error message from API response
        const errorMsg = result.message || errorMessage || "Operation failed";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
        
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('API call error:', error);
      
      // Don't show duplicate error messages if already shown above
      if (!error.message?.includes('Operation failed')) {
        toast({
          title: "Error",
          description: errorMessage || "Operation failed. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  return {
    invalidateDriverCache,
    invalidateUserCache,
    invalidateOwnerCache,
    invalidateRideCache,
    invalidatePermissionCache,
    invalidateAllCache,
    apiCallWithCacheInvalidation,
    cacheManager,
  };
}; 