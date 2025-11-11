import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@/backend/trpc/app-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        const token = await AsyncStorage.getItem('@auth_token');
        return {
          authorization: token ? `Bearer ${token}` : '',
          'content-type': 'application/json',
        };
      },
      fetch(url, options) {
        console.log('=== tRPC FETCH ===');
        console.log('URL:', url);
        console.log('Options:', {
          method: options?.method,
          headers: options?.headers,
          body: options?.body ? 'present' : 'none',
        });
        return fetch(url, options).then(async (response) => {
          console.log('=== tRPC RESPONSE ===');
          console.log('Status:', response.status);
          console.log('Content-Type:', response.headers.get('content-type'));
          
          if (!response.ok) {
            const text = await response.text();
            console.error('Response error text:', text);
            throw new Error(`HTTP ${response.status}: ${text}`);
          }
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
          }
          
          return response;
        });
      },
    }),
  ],
});
