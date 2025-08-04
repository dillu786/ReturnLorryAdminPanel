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
    cacheManager.invalidateUserQueries(userId);
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
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
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
        // Show error message
        toast({
          title: "Error",
          description: result.message || errorMessage || "Operation failed",
          variant: "destructive",
        });
        
        throw new Error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error('API call error:', error);
      toast({
        title: "Error",
        description: errorMessage || "Operation failed. Please try again.",
        variant: "destructive",
      });
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