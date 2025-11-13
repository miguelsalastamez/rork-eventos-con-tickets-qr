import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@/backend/trpc/app-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
        let token: string | null = null;
        
        if (typeof window !== 'undefined') {
          if (Platform.OS === 'web') {
            token = localStorage.getItem('@auth_token');
          } else {
            token = await AsyncStorage.getItem('@auth_token');
          }
        }
        
        return {
          authorization: token ? `Bearer ${token}` : '',
          'content-type': 'application/json',
        };
      },
      fetch(url, options) {
        console.log('=== tRPC FETCH ===');
        console.log('URL:', url);
        console.log('Method:', options?.method);
        
        return fetch(url, options).then(async (response) => {
          console.log('=== tRPC RESPONSE ===');
          console.log('Status:', response.status, response.statusText);
          console.log('Content-Type:', response.headers.get('content-type'));
          
          if (!response.ok) {
            const text = await response.text();
            console.error('❌ Backend error:', text);
            
            if (response.status === 0 || !response.status) {
              throw new Error('No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.');
            }
            
            if (response.status === 404 && (text.includes('openresty') || text.includes('nginx'))) {
              throw new Error('Backend no disponible. El servidor necesita una base de datos configurada. Lee el archivo .env para instrucciones.');
            }
            
            if (response.status === 408 || text.includes('Server did not start')) {
              throw new Error('El backend no ha iniciado. Verifica que DATABASE_URL esté configurado en .env y ejecuta: bunx prisma generate');
            }
            
            if (response.status === 500) {
              throw new Error('Error interno del servidor. Verifica los logs del backend.');
            }
            
            if (response.status === 401) {
              throw new Error('No autorizado. Por favor inicia sesión.');
            }
            
            throw new Error(`Error del servidor (${response.status}): ${text.substring(0, 200)}`);
          }
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Respuesta no-JSON:', text.substring(0, 200));
            
            if (text.includes('Cannot') || text.includes('Error')) {
              throw new Error(`Error del backend: ${text.substring(0, 200)}`);
            }
            
            throw new Error('El servidor no devolvió una respuesta JSON válida');
          }
          
          return response;
        }).catch((error) => {
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.error('❌ Error de red:', error);
            throw new Error('Backend no disponible. El servidor necesita una base de datos configurada. Lee el archivo DATABASE-SETUP-RORK.md para instrucciones.');
          }
          throw error;
        });
      },
    }),
  ],
});
