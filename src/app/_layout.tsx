import { initDatabase } from "@/database/db";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    try {
      initDatabase();
    } catch (e) {
      console.error("DB init failed:", e);
    }
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="snippet/create" />
        <Stack.Screen name="snippet/[id]" />
        <Stack.Screen name="snippet/edit/[id]" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
