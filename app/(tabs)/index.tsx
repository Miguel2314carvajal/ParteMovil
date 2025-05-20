import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

interface MenuCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  route: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();
  const fullName = user?.nombre || '';

  const handleLogout = async () => {
    await logout();
  };

  const MenuCard = ({ icon, title, route }: MenuCardProps) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        router.push(route as any);
      }}>
      <MaterialIcons name={icon} size={40} color="#007AFF" />
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="inventory" size={32} color="#007AFF" />
          <Text style={styles.logoText}>BodegaApp</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hola, {fullName} 👋</Text>
        <Text style={styles.subGreeting}>¿Qué deseas hacer hoy?</Text>
      </View>

      {/* Menu Grid */}
      <View style={styles.menuGrid}>
        <MenuCard
          icon="add-box"
          title="Registrar dispositivos y accesorios"
          route="/(tabs)/nuevo-producto"
        />
        <MenuCard
          icon="search"
          title="Stock Disponible"
          route="/(tabs)/productos"
        />
        <MenuCard
          icon="sync"
          title="Realizar Movimientos"
          route="/(tabs)/nuevo-movimiento"
        />
        <MenuCard
          icon="history"
          title="Historial"
          route="/(tabs)/historial"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  greetingContainer: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 18,
    color: '#666',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
});
