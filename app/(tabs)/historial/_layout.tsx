import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';

// Importar las pantallas de las pestañas
import MisMovimientosScreen from './mis-movimientos';
import MisProductosScreen from './mis-productos';
import MisAccesoriosScreen from './mis-accesorios';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background, paddingTop: insets.top }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.light.text,
          tabBarInactiveTintColor: Colors.light.placeholder,
          tabBarIndicatorStyle: { backgroundColor: Colors.light.text, height: 3 },
          tabBarStyle: { backgroundColor: Colors.light.background },
          tabBarLabelStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen
          name="mis-movimientos"
          component={MisMovimientosScreen}
          options={{ title: 'Mis Movimientos' }}
        />
        <Tab.Screen
          name="mis-productos"
          component={MisProductosScreen}
          options={{ title: 'Mis Dispositivos' }}
        />
        <Tab.Screen
          name="mis-accesorios"
          component={MisAccesoriosScreen}
          options={{ title: 'Mis Accesorios' }}
        />
      </Tab.Navigator>
    </View>
  );
} 