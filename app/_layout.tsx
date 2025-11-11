import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EventProvider } from "@/contexts/EventContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { UserProvider } from "@/contexts/UserContext";
import { TicketProvider } from "@/contexts/TicketContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="create-event" 
        options={{ 
          title: "Crear Evento",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="event/[id]" 
        options={{ 
          title: "Detalles del Evento"
        }} 
      />
      <Stack.Screen 
        name="event/[id]/add-attendees" 
        options={{ 
          title: "Agregar Invitados"
        }} 
      />
      <Stack.Screen 
        name="event/[id]/attendees" 
        options={{ 
          title: "Lista de Invitados"
        }} 
      />
      <Stack.Screen 
        name="event/[id]/edit" 
        options={{ 
          title: "Editar Evento"
        }} 
      />
      <Stack.Screen 
        name="ticket/[attendeeId]" 
        options={{ 
          title: "Ticket",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="scan-qr" 
        options={{ 
          title: "Escanear QR",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "Configuración",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: "Mi cuenta",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="profile/account" 
        options={{ 
          title: "Mi cuenta"
        }} 
      />
      <Stack.Screen 
        name="profile/security" 
        options={{ 
          title: "Seguridad"
        }} 
      />
      <Stack.Screen 
        name="profile/my-purchases" 
        options={{ 
          title: "Mis compras"
        }} 
      />
      <Stack.Screen 
        name="profile/payment-methods" 
        options={{ 
          title: "Métodos de pago"
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <UserProvider>
          <SettingsProvider>
            <EventProvider>
              <TicketProvider>
                <MessagingProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <RootLayoutNav />
                  </GestureHandlerRootView>
                </MessagingProvider>
              </TicketProvider>
            </EventProvider>
          </SettingsProvider>
        </UserProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
