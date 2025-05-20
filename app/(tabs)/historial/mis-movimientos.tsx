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

// TODO: Reemplazar con la interfaz real de movimientos del backend
interface Movement {
  _id: string; // Cambiado de 'id' a '_id' asumiendo el formato de Mongoose
  productName: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: string; // Podría ser necesario ajustar el tipo si es un objeto fecha
  // Agregar otros campos si son relevantes para mostrar en el historial
}

// TODO: Implementar llamada al endpoint /movimientosBodeguero
const obtenerMisMovimientos = async (searchQuery: string): Promise<Movement[]> => {
  console.log('Simulando llamada a /movimientosBodeguero con query:', searchQuery);
  // **Aquí iría la llamada a la API**
  // Ejemplo: const data = await apiService.get(`/movimientosBodeguero?search=${searchQuery}`);
  // return data;

  // Datos mockeados para pruebas (reemplazar con la llamada real)
  const mockMovements: Movement[] = [
    {
      _id: '1',
      productName: 'Producto A',
      type: 'entrada',
      quantity: 10,
      date: '2024-03-20',
    },
    {
      _id: '2',
      productName: 'Accesorio B',
      type: 'salida',
      quantity: 5,
      date: '2024-03-20',
    },
    {
      _id: '3',
      productName: 'Producto C',
      type: 'entrada',
      quantity: 15,
      date: '2024-03-19',
    },
  ];
  
  // Simular filtrado básico por nombre
  return mockMovements.filter(move => 
    move.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

export default function MisMovimientosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);

  // TODO: Cargar datos al montar el componente y cuando cambie la búsqueda
  // useEffect(() => {
  //   setLoading(true);
  //   obtenerMisMovimientos(searchQuery)
  //     .then(data => setMovements(data))
  //     .catch(error => console.error('Error fetching movements:', error))
  //     .finally(() => setLoading(false));
  // }, [searchQuery]); // Dependencia en searchQuery para refiltrar al escribir

  // Renderiza datos mockeados por ahora
  const mockMovementsForRender: Movement[] = [
    {
      _id: '1',
      productName: 'Producto A (Mock)',
      type: 'entrada',
      quantity: 10,
      date: '2024-03-20',
    },
    {
      _id: '2',
      productName: 'Accesorio B (Mock)',
      type: 'salida',
      quantity: 5,
      date: '2024-03-20',
    },
    {
      _id: '3',
      productName: 'Producto C (Mock)',
      type: 'entrada',
      quantity: 15,
      date: '2024-03-19',
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
    <View style={styles.container}>
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
        data={mockMovementsForRender} // Usando datos mockeados por ahora
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => 
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay movimientos registrados por ti</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16, // Añadir padding horizontal para mejor apariencia
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
  },
  movementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  movementInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  movementQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  quantityText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
  },
}); 