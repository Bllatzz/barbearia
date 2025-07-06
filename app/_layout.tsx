import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { databaseService } from '../services/DatabaseService';
import { filaService } from '../services/FilaService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Lobster: require('../assets/fonts/Lobster.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    async function initServices() {
      try {
        await databaseService.initDatabase();
        await filaService.iniciarMonitoramento();
      } catch (error) {
        console.error('Erro ao inicializar serviços:', error);
      }
    }

    initServices();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="fila" options={{ headerShown: false }} />
        <Stack.Screen name="painel" options={{ headerShown: false }} />
        <Stack.Screen name="configuracoes" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
