import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api'; // Ajustar la ruta si es diferente

// TODO: Definir la interfaz del producto según el endpoint /productosBodeguero si es diferente
interface ProductoBodeguero {
  _id: string;
  tipo: string;
  codigoModelo: string;
  nombreEquipo: string;
  // La cantidad parece no venir directamente, cada item es una instancia singular
  codigoBarras: string; // Corregido: es una string, no un array
  color?: string;
  capacidad?: string;
  fechaIngreso: string; // Asumiendo que hay un campo de fecha de ingreso
  // Otros campos si son necesarios (locacion, estado, etc.)
}

// Implementación real para obtener productos del bodeguero
// TODO: Modificar para aceptar filtros de fecha si el backend lo soporta, si no, filtrar en frontend
const obtenerMisProductos = async (filtros: { nombre: string, fechaDesde: string, fechaHasta: string }): Promise<ProductoBodeguero[]> => {
  console.log('Llamando a /gt/productosBodeguero con filtros:', filtros);
  try {
    // TODO: Asegurarse de que el endpoint /gt/productosBodeguero soporte filtrado por nombre y fecha
    // Si soporta, pasar el filtro como parámetro: `/gt/productosBodeguero?nombre=${filtros.nombre}&desde=${filtros.fechaDesde}&hasta=${filtros.fechaHasta}`
    // TODO: Confirmar si la ruta de bodeguero soporta filtros de fecha. Por ahora, llamamos sin filtros y filtramos en frontend.
    const response = await api.get('/gt/productosBodeguero'); // Llamada a la API para bodegueros
    console.log('Respuesta completa de /gt/productosBodeguero:', response.data); // Log para depuración

    // TODO: Verificar la estructura exacta de la respuesta y ajustarla si es necesario
    // Asumiendo que response.data contiene directamente el array de productos
     if (Array.isArray(response.data)) {
        // Simular filtrado por nombre y fecha en el frontend si el backend no lo soporta
        const filteredData = response.data.filter((p: any) => {
           const nombreMatch = p.nombreEquipo.toLowerCase().includes(filtros.nombre.toLowerCase());

           // TODO: Implementar lógica de filtrado por fecha
           // Asegurarnos de que item.fechaIngreso exista y sea una fecha válida
           const fechaProducto = p.fechaIngreso ? new Date(p.fechaIngreso) : null;
           let fechaDesdeObj = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
           let fechaHastaObj = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

           let fechaMatch = true;
           if (fechaDesdeObj && fechaProducto && fechaProducto < fechaDesdeObj) {
               fechaMatch = false;
           }
           // Añadir 23 horas, 59 minutos y 59 segundos a la fecha hasta para incluir todo el día
           if (fechaHastaObj) {
              fechaHastaObj.setHours(23, 59, 59, 999);
           }
           if (fechaHastaObj && fechaProducto && fechaProducto > fechaHastaObj) {
               fechaMatch = false;
           }

           return nombreMatch && fechaMatch; // Aplicar ambos filtros (nombre y fecha)
        });
        return filteredData as ProductoBodeguero[];
    } else {
        console.error('La respuesta de /gt/productosBodeguero no es un array:', response.data);
        return [];
    }

  } catch (error: any) {
    console.error('Error cargando mis productos:', error);
    // TODO: Manejar el error de forma más amigable
    // Si el error es 403, mostrar un mensaje específico
    if (error.response && error.response.status === 403) {
        Alert.alert('Error de Acceso', 'No tienes permiso para ver estos productos.');
    } else {
        Alert.alert('Error', error.message || 'Error al cargar mis productos');
    }
    throw error; // Re-lanzar el error para que el caller lo maneje si es necesario
  }
};

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<ProductoBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '', fechaDesde: '', fechaHasta: '' }); // Añadir filtros de fecha

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    const fetchMisProductos = async () => {
      setLoading(true);
      try {
        const data = await obtenerMisProductos(filtros);
        setProductos(data);
      } catch (error: any) {
         Alert.alert('Error', error.msg || 'Error al cargar mis productos');
         setProductos([]); // Limpiar lista en caso de error
      } finally {
        setLoading(false);
      }
    };
    fetchMisProductos();
  }, [filtros]); // Dependencia en filtros para recargar al cambiar nombre o fechas

  const verCodigosBarras = (codigos: string[], titulo: string) => {
    setCodigosBarras(codigos);
    setModalTitle(titulo);
    setModalVisible(true);
  };

  const renderProducto = ({ item }: { item: ProductoBodeguero }) => {
    console.log('Renderizando producto:', item);
    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.tipo}</Text>
        <Text style={styles.cell}>{item.codigoModelo}</Text>
        <Text style={styles.cell}>{item.nombreEquipo}</Text>
        <Text style={styles.cell}>{item.color || 'N/A'}</Text>
        <Text style={styles.cell}>{item.capacidad || 'N/A'}</Text>
        {/* Mostrar 1 como cantidad para cada producto individual */}
        <Text style={styles.cell}>1</Text>
        {/* Pasar el codigoBarras como un array de un solo elemento */}
        <TouchableOpacity onPress={() => verCodigosBarras([item.codigoBarras], `Código de Barras de ${item.nombreEquipo}`)} style={styles.codesIcon}>
          <MaterialIcons name="visibility" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros (simplificado para esta vista) */}
      <View style={styles.filtrosContainer}>
         {/* Input Fecha Desde */}
         <TextInput
            style={styles.dateInput}
            placeholder="Desde: dd/mm/aaaa"
            value={filtros.fechaDesde}
            onChangeText={text => setFiltros({ ...filtros, fechaDesde: text })}
            // TODO: Considerar usar un DatePicker
         />
          {/* Input Fecha Hasta */}
         <TextInput
            style={styles.dateInput}
            placeholder="Hasta: dd/mm/aaaa"
            value={filtros.fechaHasta}
            onChangeText={text => setFiltros({ ...filtros, fechaHasta: text })}
            // TODO: Considerar usar un DatePicker
         />
          {/* Botón Filtrar */}
        <TouchableOpacity 
          style={styles.filterButton}
          // El useEffect ya reacciona a los cambios en los filtros
          // onPress={() => { /* opcional: refetch explícito si no se usa useEffect con dependencia */ } }
        >
           <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>

      </View>

      {/* Encabezado de la tabla */}
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Tipo</Text>
        <Text style={styles.headerCell}>Código Modelo</Text>
        <Text style={styles.headerCell}>Nombre</Text>
        <Text style={styles.headerCell}>Color</Text>
        <Text style={styles.headerCell}>Capacidad</Text>
        <Text style={styles.headerCell}>Cantidad</Text>
        <Text style={styles.headerCell}>Códigos</Text>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={() =>
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No has registrado productos</Text> : null
        }
        // TODO: Implementar lógica de loading indicator si es necesario
        // refreshing={loading}
        // onRefresh={cargarMisProductos}
      />

      {/* Modal para mostrar los códigos de barras */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {codigosBarras.length > 0 ? (
                codigosBarras.map((codigo, idx) => (
                  <Text key={idx} style={{ fontSize: 16, marginBottom: 6, textAlign: 'center' }}>
                    {codigo}
                  </Text>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: '#888' }}>No hay códigos de barras</Text>
              )}
            </ScrollView>
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
    padding: 16,
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
  // Asegurarnos de que searchInput exista aunque no se use en esta vista si se necesita en otra parte del archivo
  searchInput: { // Mantener para consistencia si se usa en otra parte, si no, eliminar
     borderWidth: 1,
     borderColor: '#ccc',
     borderRadius: 6,
     padding: 8,
     backgroundColor: '#fff',
     height: 40,
     flex: 1,
     marginRight: 8,
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
  headerRow: { flexDirection: 'row', backgroundColor: '#eee', paddingVertical: 8, marginBottom: 8, borderRadius: 6 },
  headerCell: { flex: 1, fontWeight: 'bold', textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 12, alignItems: 'center' },
  cell: { flex: 1, textAlign: 'center' },
  codesIcon: {
    paddingHorizontal: 10, // Añadir padding para que el área táctil sea más grande
  },
  modalOverlay: { // Asegurarnos de que estos estilos existen si se usan en el modal
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { // Asegurarnos de que estos estilos existen si se usan en el modal
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: { // Asegurarnos de que estos estilos existen si se usan en el modal
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: { // Asegurarnos de que estos estilos existen si se usan en el modal
    marginTop: 16,
    alignSelf: 'center',
  },
  closeButtonText: { // Asegurarnos de que estos estilos existen si se usan en el modal
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 