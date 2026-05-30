// src/app/_layout.tsx

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '@/database/db';

export default function RootLayout() {
  useEffect(() => {
    try {
      initDatabase();
    } catch (error) {
      console.error('DB init failed:', error);
    }
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)"            options={{ headerShown: false }} />
        <Stack.Screen name="snippet/create"    options={{ headerShown: false }} />
        <Stack.Screen name="snippet/[id]"      options={{ headerShown: false }} />
        <Stack.Screen name="snippet/edit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="settings"          options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}