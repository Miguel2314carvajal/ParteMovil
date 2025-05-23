import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView
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
const obtenerMisMovimientos = async (searchQuery: string, fechaDesde: string, fechaHasta: string): Promise<Movement[]> => {
  console.log('Llamando a /gt/movimientosBodeguero con query y filtros de fecha:', searchQuery, fechaDesde, fechaHasta);
  try {
    // TODO: Confirmar si el endpoint /gt/movimientosBodeguero soporta filtrado por fecha.
    // Si soporta, pasar los parámetros de fecha: `/gt/movimientosBodeguero?desde=${fechaDesde}&hasta=${fechaHasta}`
    // Si no soporta, llamar sin parámetros y filtrar en el frontend.

    // Por ahora, asumimos que SÍ soporta filtrado por fecha:
    const response = await api.get(`/gt/movimientosBodeguero?desde=${fechaDesde}&hasta=${fechaHasta}`);

    console.log('Respuesta completa de /gt/movimientosBodeguero:', response.data); // Log para depuración

    // La respuesta esperada es directamente el array de movimientos en response.data
    // Asegurarse de que response.data sea realmente un array antes de retornarlo
    if (Array.isArray(response.data)) {
        // TODO: Si el backend no soporta filtrado por fecha, implementar filtrado aquí en el frontend
        return response.data as Movement[];
    } else {
        console.error('La respuesta de /gt/movimientosBodeguero no es un array:', response.data);
        return [];
    }

  } catch (error: any) {
    console.error('Error al obtener mis movimientos:', error);
    // TODO: Manejar el error de forma más amigable si es necesario
     // Si el error es 403, mostrar un mensaje específico
    if (error.response && error.response.status === 403) {
        Alert.alert('Error de Acceso', 'No tienes permiso para ver estos movimientos.');
    } else {
        Alert.alert('Error', error.message || 'Error al cargar mis movimientos');
    }
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Cargar datos al montar el componente y cuando cambie la búsqueda o los filtros de fecha
  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true);
      try {
        const data = await obtenerMisMovimientos(searchQuery, fechaDesde, fechaHasta);
        
        setMovements(data);
      } catch (error: any) {
        Alert.alert('Error', error.msg || 'Error al cargar mis movimientos');
        setMovements([]); // Limpiar lista en caso de error
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, [searchQuery, fechaDesde, fechaHasta]); // Dependencia en searchQuery y fechas para recargar al cambiar

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

  // Función para abrir el modal de detalle
  const handleVerDetalle = (movement: Movement) => {
    setSelectedMovement(movement);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Movement }) => (
    <TouchableOpacity onPress={() => handleVerDetalle(item)} style={styles.movementCard}>
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Contenedor para los filtros de fecha y el botón */}
      <View style={styles.filtrosContainer}>
        {/* Input Fecha Desde */}
        <TextInput
          style={styles.dateInput}
          placeholder="Desde: dd/mm/aaaa"
          value={fechaDesde}
          onChangeText={setFechaDesde}
          // TODO: Considerar usar un DatePicker para una mejor experiencia de usuario
        />
        {/* Input Fecha Hasta */}
        <TextInput
          style={styles.dateInput}
          placeholder="Hasta: dd/mm/aaaa"
          value={fechaHasta}
          onChangeText={setFechaHasta}
          // TODO: Considerar usar un DatePicker
        />
        {/* Botón Filtrar */}
        <TouchableOpacity 
          style={styles.filterButton}
          // TODO: Implementar la lógica de filtrado al hacer clic
          // Por ahora, el useEffect ya reacciona a los cambios en fechaDesde y fechaHasta
          // onPress={() => { /* llamar a fetchMovements o similar */ }}
        >
           <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
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

      {/* Modal para mostrar los detalles del movimiento */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalle del Movimiento</Text>
            {selectedMovement && (
              <ScrollView>
                {/* Aquí se mostrarán los detalles del movimiento seleccionado */}
                <Text>Fecha: {new Date(selectedMovement.fecha).toLocaleString()}</Text>
                <Text>Responsable: {selectedMovement.responsable?.[0]?.nombreResponsable || 'N/A'}</Text>
                <Text>Área de Salida: {selectedMovement.areaSalida || 'N/A'}</Text>
                <Text>Área Llegada: {selectedMovement.areaLlegada || 'N/A'}</Text>

                {/* Lista de Productos en el movimiento */}
                {selectedMovement.productos && selectedMovement.productos.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Productos</Text>
                    {selectedMovement.productos.map((producto, index) => (
                      <View key={index} style={styles.detailRow}>
                        {/* Ajustar según los campos disponibles en el objeto producto anidado */}
                        <Text style={styles.detailText}>- {producto.nombreEquipo || 'Producto sin nombre'} ({producto.codigoBarras || 'Sin Código'})</Text>
                         {/* TODO: Agregar otros detalles como cantidad si vienen en el objeto anidado */}
                      </View>
                    ))}
                  </View>
                )}

                {/* Lista de Accesorios en el movimiento */}
                 {selectedMovement.accesorios && selectedMovement.accesorios.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Accesorios</Text>
                    {selectedMovement.accesorios.map((accesorio, index) => (
                      <View key={index} style={styles.detailRow}>
                        {/* Ajustar según los campos disponibles en el objeto accesorio anidado */}
                        <Text style={styles.detailText}>- {accesorio.nombreAccs || 'Accesorio sin nombre'} ({accesorio.codigoBarrasAccs || 'Sin Código'})</Text>
                        {/* TODO: Agregar otros detalles como cantidad si vienen en el objeto anidado */}
                      </View>
                    ))}
                  </View>
                )}

                {/* TODO: Mostrar otros detalles del movimiento si es necesario */}

              </ScrollView>
            )}
            {/* Botón para cerrar el modal */}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16, // Añadir padding horizontal para mejor apariencia
  },
  // Estilos para la sección de filtros (copiar de mis-accesorios.tsx)
  filtrosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  // Estilos para inputs de fecha (copiar de mis-accesorios.tsx)
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    height: 40,
    flex: 1, // Ocupa espacio disponible
    marginRight: 8, // Espacio a la derecha
  },
  // Estilos para el botón de filtrar (copiar de mis-accesorios.tsx)
  filterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8, // Ajustar padding si es necesario
    paddingHorizontal: 12, // Ajustar padding si es necesario
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // searchContainer y searchIcon ya no se usan en esta vista, se pueden eliminar o dejar comentados si se usan en otro lado
  // searchContainer: { ... },
  // searchIcon: { ... },
  // searchInput ya no se usa en esta vista, se puede eliminar o dejar comentado
  // searchInput: { ... },
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
  movementQuantity: { // Este estilo probablemente ya no sea necesario
    // flexDirection: 'row',
    // alignItems: 'center',
    // paddingHorizontal: 12,
    // paddingVertical: 8,
    // borderRadius: 8,
  },
  quantityText: { // Este estilo probablemente ya no sea necesario
    // marginLeft: 4,
    // fontWeight: 'bold',
    // fontSize: 16,
  },
  listContainer: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
   detailSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
  },
  closeButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 