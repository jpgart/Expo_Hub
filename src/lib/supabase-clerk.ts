import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

/**
 * Hook to get a Supabase client with Clerk authentication
 * Use this in React components that need authenticated Supabase access
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Function to get the JWT token from Clerk
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({
            template: 'supabase' // JWT template name in Clerk
          });

          // Add the Authorization header if we have a token
          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          // Call the default fetch with the modified headers
          return fetch(url, {
            ...options,
            headers
          });
        }
      }
    }
  );
}
