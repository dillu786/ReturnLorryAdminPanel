import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CACHE_KEYS } from '@/lib/cache-utils'

interface UseStatusToggleOptions {
  entityType: 'driver' | 'user' | 'owner' | 'role'
  cacheKey: string
  apiEndpoint: string
}

export function useStatusToggle({ entityType, cacheKey, apiEndpoint }: UseStatusToggleOptions) {
  const queryClient = useQueryClient()

  const toggleStatus = useCallback(async (entityId: number | string, isActive: boolean) => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          [`${entityType}Id`]: entityId,
          isActive 
        }),
      })
      
      if (response.ok) {
        // Invalidate cache to refresh data
        queryClient.invalidateQueries({ queryKey: [cacheKey] })
        return { success: true }
      } else {
        const errorData = await response.json()
        return { 
          success: false, 
          error: errorData.error || `Failed to ${isActive ? 'activate' : 'deactivate'} ${entityType}` 
        }
      }
    } catch (error) {
      console.error('Status update error:', error)
      return { 
        success: false, 
        error: `Failed to ${isActive ? 'activate' : 'deactivate'} ${entityType}` 
      }
    }
  }, [entityType, cacheKey, apiEndpoint, queryClient])

  return { toggleStatus }
} 