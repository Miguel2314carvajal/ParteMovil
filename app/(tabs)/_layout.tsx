import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: { display: 'none' }, // Oculta el tab bar
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial', 
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="nuevo-movimiento"
        options={{
          title: 'Realizar Movimiento',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          title: 'Stock Disponible',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="nuevo-producto"
        options={{
          title: 'Registrar Dispositivos y Accesorios',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}