import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '@/constants/Colors';

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
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={36} color={Colors.light.accent} />
      </View>
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
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
          icon="archive"
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
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.light.text,
  },
  logoutButton: {
    backgroundColor: '#F5F5F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  greetingContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.light.text,
  },
  subGreeting: {
    fontSize: 18,
    color: Colors.light.placeholder,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.light.card,
    width: '48%',
    aspectRatio: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    // No longer using flex: 1 to allow natural centering
  },
  cardText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.light.text,
    // Removed fixed height to allow natural text wrapping
  },
});