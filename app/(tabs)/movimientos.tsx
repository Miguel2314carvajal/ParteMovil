import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Movement {
  id: string;
  productName: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: string;
}

export default function MovimientosScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Reemplazar con datos reales de la API
  const mockMovements: Movement[] = [
    {
      id: '1',
      productName: 'Producto 1',
      type: 'entrada',
      quantity: 10,
      date: '2024-03-19',
    },
    {
      id: '2',
      productName: 'Producto 2',
      type: 'salida',
      quantity: 5,
      date: '2024-03-19',
    },
    {
      id: '3',
      productName: 'Producto 3',
      type: 'entrada',
      quantity: 15,
      date: '2024-03-18',
    },
  ];

  const renderItem = ({ item }: { item: Movement }) => (
    <View style={styles.movementCard}>
      <View style={styles.movementInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View
        style={[
          styles.movementQuantity,
          { backgroundColor: item.type === 'entrada' ? '#e6f3ff' : '#ffe6e6' },
        ]}>
        <MaterialIcons
          name={item.type === 'entrada' ? 'arrow-downward' : 'arrow-upward'}
          size={20}
          color={item.type === 'entrada' ? '#007AFF' : '#FF3B30'}
        />
        <Text
          style={[
            styles.quantityText,
            { color: item.type === 'entrada' ? '#007AFF' : '#FF3B30' },
          ]}>
          {item.type === 'entrada' ? '+' : '-'}{item.quantity}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Movimientos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {/* TODO: Implementar registro de movimiento */}}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar movimientos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={mockMovements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  movementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  movementInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  movementQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 