import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { lab } from '@/game/look';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  return (
    <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, primary: lab.cyan, background: lab.bg, card: lab.bg, text: lab.text, border: lab.line } }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: lab.bg },
          headerTintColor: lab.text,
          headerTitleStyle: { fontWeight: '800' },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: lab.bg },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="play/[level]" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="explorer" options={{ title: 'Explorer' }} />
        <Stack.Screen name="element/[z]" options={{ title: '', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
