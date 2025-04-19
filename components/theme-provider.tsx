'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

const ThemeProvider = React.memo(function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return (
    <div suppressHydrationWarning>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </div>
  )
})

ThemeProvider.displayName = 'ThemeProvider'

export { ThemeProvider }
