'use client';
// Temporarily disabled Clerk authentication
// import { ClerkProvider } from '@clerk/nextjs';
// import { dark } from '@clerk/themes';
// import { useTheme } from 'next-themes';
import React from 'react';
import { ActiveThemeProvider } from '../active-theme';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  // Temporarily disabled theme resolution for Clerk
  // const { resolvedTheme } = useTheme();

  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        {/* Temporarily disabled ClerkProvider */}
        {/* <ClerkProvider
          appearance={{
            baseTheme: resolvedTheme === 'dark' ? dark : undefined
          }}
        > */}
        {children}
        {/* </ClerkProvider> */}
      </ActiveThemeProvider>
    </>
  );
}
