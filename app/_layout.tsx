import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../context/AuthContext';
import { LogBox } from 'react-native';
import { Colors } from '@/constants/Colors';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const paperTheme = (colorScheme) => ({
  ...MD3LightTheme,
  dark: colorScheme === 'dark',
  mode: colorScheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colorScheme === 'dark' ? Colors.dark.accent : Colors.light.accent,
    background: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
    surface: colorScheme === 'dark' ? Colors.dark.card : Colors.light.card,
    text: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
    onSurface: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text,
    outline: colorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
    placeholder: colorScheme === 'dark' ? Colors.dark.placeholder : Colors.light.placeholder,
    // Puedes agregar más si lo necesitas
  },
});

LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components in a future major release'
]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme(colorScheme)}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
