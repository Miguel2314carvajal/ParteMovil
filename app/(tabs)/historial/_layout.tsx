import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

// Importar las pantallas de las pestañas
import MisMovimientosScreen from './mis-movimientos';
import MisProductosScreen from './mis-productos';
import MisAccesoriosScreen from './mis-accesorios';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    // Wrap the Tab.Navigator in a View to apply padding top
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
          tabBarStyle: { backgroundColor: 'white' },
        }}
      >
        {/* Aquí definimos las pantallas de las pestañas usando la prop component */}
        <Tab.Screen
          name="index" // 'index' en una carpeta se refiere al archivo index.tsx dentro de esa carpeta
          component={MisMovimientosScreen}
          options={{ title: 'Mis Movimientos' }}
        />
        <Tab.Screen
          name="productos"
          component={MisProductosScreen}
          options={{ title: 'Mis Productos' }}
        />
        <Tab.Screen
          name="accesorios"
          component={MisAccesoriosScreen}
          options={{ title: 'Mis Accesorios' }}
        />
      </Tab.Navigator>
    </View>
  );
} 