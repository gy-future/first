import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6858ea804224c24e17d8216c", 
  requiresAuth: true // Ensure authentication is required for all operations
});
