import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// TODO: Importar la API service para productos
// import { productService } from '../../services/api';

// TODO: Definir la interfaz del producto según el endpoint /productosBodeguero
interface ProductoBodeguero {
  _id: string;
  tipo: string;
  codigoModelo: string;
  nombreEquipo: string;
  cantidad: number;
  codigoB: string[]; // Asumiendo que el endpoint devuelve los códigos de barras directamente
  // Otros campos si son necesarios
}

// TODO: Implementar la llamada al endpoint /productosBodeguero con filtros si es necesario
const obtenerMisProductos = async (filtros: any): Promise<ProductoBodeguero[]> => {
  console.log('Simulando llamada a /productosBodeguero con filtros:', filtros);
  // **Aquí iría la llamada a la API**
  // Ejemplo: const data = await productService.obtenerProductosBodeguero(filtros);
  // return data;

  // Datos mockeados para pruebas (reemplazar con la llamada real)
  const mockProductos: ProductoBodeguero[] = [
    {
      _id: 'prod1',
      tipo: 'Nuevo',
      codigoModelo: '15S128AMA',
      nombreEquipo: 'iPhone 15',
      cantidad: 2,
      codigoB: ['CB001', 'CB002'],
    },
    {
      _id: 'prod2',
      tipo: 'Openbox',
      codigoModelo: '11S64BLA',
      nombreEquipo: 'iPhone 11',
      cantidad: 1,
      codigoB: ['CB003'],
    },
  ];

  // Simular filtrado básico por nombre (ajustar según los filtros reales)
  return mockProductos.filter(p => 
    p.nombreEquipo.toLowerCase().includes(filtros.nombre?.toLowerCase() || '')
  );
};

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<ProductoBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '' }); // Filtro básico de nombre

  const cargarMisProductos = async () => {
    setLoading(true);
    try {
      const data = await obtenerMisProductos(filtros);
      setProductos(data);
    } catch (error) {
      console.error('Error cargando mis productos:', error);
      // TODO: Mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisProductos();
  }, [filtros]); // Recargar al cambiar filtros

  const verCodigosBarras = (codigos: string[], titulo: string) => {
    setCodigosBarras(codigos);
    setModalTitle(titulo);
    setModalVisible(true);
  };

  const renderProducto = ({ item }: { item: ProductoBodeguero }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.tipo}</Text>
      <Text style={styles.cell}>{item.codigoModelo}</Text>
      <Text style={styles.cell}>{item.nombreEquipo}</Text>
      <Text style={styles.cell}>{item.cantidad}</Text>
      <TouchableOpacity onPress={() => verCodigosBarras(item.codigoB, `Códigos de Barras de ${item.nombreEquipo}`)} style={styles.codesIcon}>
        <MaterialIcons name="visibility" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

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