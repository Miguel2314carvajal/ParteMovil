import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api';

// Interfaz real de movimientos según la respuesta del backend
interface Movement {
  _id: string;
  productos: { // Array de productos involucrados
    _id: string;
    codigoBarras: string; // O el campo identificador del producto si es diferente
    nombreEquipo?: string; // Si estos campos vienen anidados en la respuesta
    cantidad?: number; // Cantidad de este producto en particular en el movimiento
    // Agregar otros campos del producto si son necesarios para mostrar
  }[];
  accesorios: { // Array de accesorios involucrados
    _id: string;
    codigoBarrasAccs: string; // O el campo identificador del accesorio
    nombreAccs?: string; // Si vienen anidados
    cantidad?: number; // Cantidad de este accesorio en particular
    // Agregar otros campos del accesorio si son necesarios
  }[];
  responsable: { // Array con la información del responsable
     _id: string;
     nombreResponsable: string;
     // otros campos del responsable
  }[]; // Aunque la imagen muestra un array de 1, usar array por si acaso
  areaLlegada: string;
  areaSalida: string; // Asumiendo que también viene este campo
  observacion: string;
  fecha: string; // O ajustar si es un objeto Fecha o timestamp que necesitas parsear
  __v: number;
}

// Implementación real para obtener movimientos del bodeguero
const obtenerMisMovimientos = async (searchQuery: string): Promise<Movement[]> => {
  console.log('Llamando a /gt/movimientosBodeguero con query:', searchQuery);
  try {
    const response = await api.get('/gt/movimientosBodeguero'); // Llamada a la API
    console.log('Respuesta completa de /gt/movimientosBodeguero:', response.data); // Log para depuración
    
    // La respuesta esperada es directamente el array de movimientos en response.data
    // Asegurarse de que response.data sea realmente un array antes de retornarlo
    if (Array.isArray(response.data)) {
        return response.data as Movement[];
    } else {
        console.error('La respuesta de /gt/movimientosBodeguero no es un array:', response.data);
        // Retornar un array vacío o lanzar un error, según cómo quieras manejarlo
        return [];
    }

  } catch (error: any) {
    console.error('Error al obtener mis movimientos:', error);
    // TODO: Manejar el error de forma más amigable si es necesario
    throw error; // Re-lanzar el error para que el caller lo maneje
  }
  
  /*
  // --- Código mockeado anterior (comentado) ---
  console.log('Simulando llamada a /movimientosBodeguero con query:', searchQuery);
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
  return mockMovements.filter(move => 
    move.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // --- Fin código mockeado anterior ---
  */
};

export default function MisMovimientosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos al montar el componente y cuando cambie la búsqueda
  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const data = await obtenerMisMovimientos(searchQuery);
        setMovements(data);
      } catch (error: any) {
        Alert.alert('Error', error.msg || 'Error al cargar mis movimientos');
        setMovements([]); // Limpiar lista en caso de error
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, [searchQuery]); // Dependencia en searchQuery para refiltrar al escribir

  // // --- Código mockeado anterior (comentado) ---
  // const mockMovementsForRender: Movement[] = [
  //   {
  //     _id: '1',
  //     productName: 'Producto A (Mock)',
  //     type: 'entrada',
  //     quantity: 10,
  //     date: '2024-03-20',
  //   },
  //   {
  //     _id: '2',
  //     productName: 'Accesorio B (Mock)',
  //     type: 'salida',
  //     quantity: 5,
  //     date: '2024-03-20',
  //   },
  //   {
  //     _id: '3',
  //     productName: 'Producto C (Mock)',
  //     type: 'entrada',
  //     quantity: 15,
  //     date: '2024-03-19',
  //   },
  // ];
  // // --- Fin código mockeado anterior ---

  const renderItem = ({ item }: { item: Movement }) => (
    <View style={styles.movementCard}>
      <View style={styles.movementInfo}>
        {/* Mostrar fecha y áreas */}
        {/* TODO: Formatear la fecha si es necesario */}
        <Text style={styles.date}>{new Date(item.fecha).toLocaleString()}</Text>
        <Text style={styles.movementDetailText}>De: {item.areaSalida || 'N/A'}</Text>
        <Text style={styles.movementDetailText}>A: {item.areaLlegada || 'N/A'}</Text>
        
        {/* Mostrar resumen de productos y accesorios */}
        {item.productos && item.productos.length > 0 && (
          <Text style={styles.movementDetailText}>Productos: {item.productos.length}</Text>
        )}
        {item.accesorios && item.accesorios.length > 0 && (
          <Text style={styles.movementDetailText}>Accesorios: {item.accesorios.length}</Text>
        )}

        {/* Mostrar observación */}
        <Text style={styles.observationText}>Obs: {item.observacion || 'Sin observación'}</Text>
        
        {/* TODO: Opcional: Mostrar responsable */}
        {/* {item.responsable && item.responsable.length > 0 && (
            <Text style={styles.movementDetailText}>Responsable: {item.responsable[0].nombreResponsable}</Text>
        )} */}

      </View>
      {/* TODO: Reconsiderar si mostrar cantidad total o no, ya que ahora hay productos y accesorios separados */}
      {/* La vista de cantidad total del mock ya no aplica directamente */}
      {/* <View
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
      </View> */}
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
        data={movements} // Usando los datos del estado cargados de la API
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => 
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay movimientos registrados por ti</Text> : null
        }
        // TODO: Implementar lógica de loading indicator si es necesario
        // refreshing={loading}
        // onRefresh={fetchMovements} // Permite recargar al tirar hacia abajo
      />
      {/* TODO: Mostrar un indicador de carga (ActivityIndicator) si loading es true */}
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
    flexDirection: 'column', // Cambiar a columna para apilar la info
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
    marginBottom: 8, // Espacio entre info y observación/cantidad
  },
  productName: { // Este estilo ya no se usará para el nombre principal
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4, // Espacio debajo de la fecha
  },
   movementDetailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  observationText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginTop: 4, // Espacio encima de la observación
  },
  // movementQuantity: { // Este estilo probablemente ya no sea necesario
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   borderRadius: 8,
  //   minWidth: 80,
  //   justifyContent: 'center',
  // },
  // quantityText: { // Este estilo probablemente ya no sea necesario
  //   fontSize: 16,
  //   fontWeight: 'bold',
  //   marginLeft: 4,
  // },
  listContainer: {
    padding: 10,
  },
}); 