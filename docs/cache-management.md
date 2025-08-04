# Cache Management System

This document explains the comprehensive cache management system implemented across the application to ensure data consistency and proper cache invalidation.

## Overview

The cache management system provides centralized cache invalidation utilities to ensure that when data is updated, all related queries are properly invalidated and refreshed.

## Components

### 1. Cache Keys (`lib/cache-utils.ts`)

Centralized cache key constants to ensure consistency across the application:

```typescript
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
} as const;
```

### 2. Cache Manager (`lib/cache-utils.ts`)

The `CacheManager` class provides methods to invalidate related queries:

```typescript
// Invalidate driver-related queries
invalidateDriverQueries(driverId?: string)

// Invalidate all related queries when a driver is updated
invalidateDriverRelatedQueries(driverId?: string)

// Similar methods for users, owners, rides, etc.
```

### 3. Cache Invalidation Hook (`hooks/use-cache-invalidation.ts`)

A React hook that provides easy-to-use cache invalidation functions:

```typescript
const {
  invalidateDriverCache,
  invalidateUserCache,
  invalidateOwnerCache,
  invalidateRideCache,
  invalidatePermissionCache,
  invalidateAllCache,
  apiCallWithCacheInvalidation,
} = useCacheInvalidation();
```

## Usage Examples

### Basic Cache Invalidation

```typescript
import { useCacheInvalidation } from '@/hooks/use-cache-invalidation';

const { invalidateDriverCache } = useCacheInvalidation();

// Invalidate all driver-related queries
invalidateDriverCache();

// Invalidate specific driver and related queries
invalidateDriverCache(driverId);
```

### API Calls with Automatic Cache Invalidation

```typescript
const { apiCallWithCacheInvalidation, invalidateDriverCache } = useCacheInvalidation();

const handleVerify = useCallback(async (driverId: string, documentType: string) => {
  await apiCallWithCacheInvalidation(
    `/api/drivers/${driverId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentType }),
    },
    () => invalidateDriverCache(driverId),
    "Document verified successfully!",
    "Failed to verify document"
  );
}, [apiCallWithCacheInvalidation, invalidateDriverCache]);
```

### Using Cache Keys in Queries

```typescript
import { CACHE_KEYS } from '@/lib/cache-utils';

const { data, isLoading } = useQuery({
  queryKey: [CACHE_KEYS.DRIVERS, page],
  queryFn: fetchDrivers,
});
```

## Cache Invalidation Strategies

### 1. Entity-Specific Invalidation

When updating a specific entity (driver, user, owner, etc.), invalidate:
- The specific entity query
- The list query for that entity type
- Any related queries (e.g., documents for drivers/owners)

### 2. Related Data Invalidation

When updating data that affects multiple entities:
- Driver updates → Invalidate drivers, documents
- Owner updates → Invalidate owners, documents
- Permission updates → Invalidate permissions, roles

### 3. Cross-Entity Invalidation

Some operations affect multiple entity types:
- Document verification → Invalidate both driver/owner and documents
- Status changes → Invalidate the specific entity and any lists

## Best Practices

### 1. Use Cache Keys Constants

Always use the centralized cache keys to ensure consistency:

```typescript
// ✅ Good
queryKey: [CACHE_KEYS.DRIVERS, page]

// ❌ Bad
queryKey: ["drivers", page]
```

### 2. Use the Cache Invalidation Hook

Prefer the hook over direct cache manager usage:

```typescript
// ✅ Good
const { invalidateDriverCache } = useCacheInvalidation();
invalidateDriverCache(driverId);

// ❌ Avoid direct usage
queryClient.invalidateQueries({ queryKey: ["drivers"] });
```

### 3. Use API Call Helper

For API calls that need cache invalidation, use the helper function:

```typescript
// ✅ Good - Automatic cache invalidation and error handling
await apiCallWithCacheInvalidation(
  url,
  options,
  () => invalidateDriverCache(driverId),
  successMessage,
  errorMessage
);

// ❌ Avoid manual implementation
const response = await fetch(url, options);
if (response.ok) {
  invalidateDriverCache(driverId);
  toast({ title: "Success", description: "..." });
}
```

### 4. Invalidate Related Queries

When updating data, consider what other queries might be affected:

```typescript
// When verifying a driver document, also invalidate documents list
invalidateDriverRelatedQueries(driverId);
```

## Migration Guide

### From Manual Cache Invalidation

**Before:**
```typescript
const handleVerify = async (driverId: string) => {
  const response = await fetch(`/api/drivers/${driverId}`, {
    method: 'PATCH',
    body: JSON.stringify({ documentType: 'dl-front' }),
  });
  
  if (response.ok) {
    queryClient.invalidateQueries({ queryKey: ["driver", driverId] });
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
    toast({ title: "Success", description: "Verified!" });
  }
};
```

**After:**
```typescript
const { apiCallWithCacheInvalidation, invalidateDriverCache } = useCacheInvalidation();

const handleVerify = useCallback(async (driverId: string) => {
  await apiCallWithCacheInvalidation(
    `/api/drivers/${driverId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ documentType: 'dl-front' }),
    },
    () => invalidateDriverCache(driverId),
    "Document verified successfully!",
    "Failed to verify document"
  );
}, [apiCallWithCacheInvalidation, invalidateDriverCache]);
```

## Troubleshooting

### Common Issues

1. **Data not updating after operations**
   - Ensure you're using the cache invalidation hook
   - Check that all related queries are being invalidated
   - Verify cache keys are consistent

2. **Stale data in different components**
   - Use the same cache keys across components
   - Invalidate all related queries, not just the specific one

3. **Performance issues**
   - Avoid invalidating all queries unnecessarily
   - Use specific invalidation methods when possible

### Debugging

Enable React Query DevTools to inspect cache state:

```typescript
// In your app
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to your component tree
<ReactQueryDevtools initialIsOpen={false} />
```

## Future Enhancements

1. **Automatic Cache Invalidation**: Detect related queries automatically
2. **Cache Warming**: Pre-populate cache for common queries
3. **Selective Invalidation**: Invalidate only specific parts of queries
4. **Cache Analytics**: Track cache hit/miss rates 