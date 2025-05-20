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
  // Otros campos si son necesarios (fechaIngreso, locacion, estado, etc.)
}

// Implementación real para obtener productos del bodeguero
const obtenerMisProductos = async (filtros: { nombre: string }): Promise<ProductoBodeguero[]> => {
  console.log('Llamando a /gt/productosBodeguero con filtros:', filtros);
  try {
    // TODO: Asegurarse de que el endpoint /gt/productosBodeguero soporte filtrado por nombre
    // Si soporta, pasar el filtro como parámetro: `/gt/productosBodeguero?nombre=${filtros.nombre}`
    const response = await api.get('/gt/productosBodeguero'); // Llamada a la API
    console.log('Respuesta completa de /gt/productosBodeguero:', response.data); // Log para depuración
    
    // TODO: Verificar la estructura exacta de la respuesta y ajustarla si es necesario
    // Asumiendo que response.data contiene directamente el array de productos
     if (Array.isArray(response.data)) {
        // Simular filtrado por nombre en el frontend si el backend no lo soporta
        const filteredData = response.data.filter((p: any) => 
           p.nombreEquipo.toLowerCase().includes(filtros.nombre.toLowerCase())
        );
        return filteredData as ProductoBodeguero[];
    } else {
        console.error('La respuesta de /gt/productosBodeguero no es un array:', response.data);
        return [];
    }

  } catch (error: any) {
    console.error('Error cargando mis productos:', error);
    // TODO: Manejar el error de forma más amigable
    throw error;
  }
  
  /*
  // --- Código mockeado anterior (comentado) ---
  console.log('Simulando llamada a /productosBodeguero con filtros:', filtros);
  const mockProductos: ProductoBodeguero[] = [
// ... existing code ...
  return mockProductos.filter(p => 
    p.nombreEquipo.toLowerCase().includes(filtros.nombre?.toLowerCase() || '')
  );
  // --- Fin código mockeado anterior ---
  */
};

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<ProductoBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '' }); // Filtro básico de nombre

  // Cargar datos al montar el componente y cuando cambie los filtros
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
  }, [filtros]); // Dependencia en filtros para recargar al cambiar nombre

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
         <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            value={filtros.nombre}
            onChangeText={text => setFiltros({ ...filtros, nombre: text })}
         />
         {/* TODO: Agregar botón de filtrar si se necesitan más filtros o una acción explícita */}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%', maxHeight: '70%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
              {modalTitle}
            </Text>
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
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 16, alignSelf: 'center' }}>
              <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Cerrar</Text>
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
   filtrosContainer: {
    marginBottom: 12,
    // Añadir estilos si se necesitan más filtros en fila
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    height: 40,
  },
  headerRow: { flexDirection: 'row', backgroundColor: '#eee', paddingVertical: 8, marginBottom: 8, borderRadius: 6 },
  headerCell: { flex: 1, fontWeight: 'bold', textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 12, alignItems: 'center' },
  cell: { flex: 1, textAlign: 'center' },
  codesIcon: {
    paddingHorizontal: 10, // Añadir padding para que el área táctil sea más grande
  },
}); 