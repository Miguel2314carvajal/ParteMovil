import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api'; // Ajustar la ruta si es diferente

// TODO: Definir la interfaz del accesorio según el endpoint /accesoriosBodeguero si es diferente
interface AccesorioBodeguero {
  _id: string;
  __v: number;
  categoriaNombre: any[]; // Puedes refinar esto si necesitas acceder a los detalles de la categoría
  codigoBarrasAccs: string; // Este es el campo que buscamos
  codigoModeloAccs: string;
  disponibilidadAccs: string;
  fechaIngreso: string; // O Date si la parseas
  locacionAccs: string;
  nombreAccs: string;
  precioAccs: number; // O string, dependiendo de la API
  responsableAccs: any[]; // Puedes refinar esto también
}

// Implementación real para obtener accesorios del bodeguero
const obtenerMisAccesorios = async (filtros: { nombre: string }): Promise<AccesorioBodeguero[]> => {
  console.log('Llamando a /gt/accesoriosBodeguero con filtros:', filtros);
  try {
    // TODO: Asegurarse de que el endpoint /gt/accesoriosBodeguero soporte filtrado por nombre
    // Si soporta, pasar el filtro como parámetro: `/gt/accesoriosBodeguero?nombre=${filtros.nombre}`
    const response = await api.get('/gt/accesoriosBodeguero'); // Llamada a la API
     console.log('Respuesta completa de /gt/accesoriosBodeguero:', response.data); // Log para depuración
    
    // TODO: Verificar la estructura exacta de la respuesta y ajustarla si es necesario
    // Asumiendo que response.data contiene directamente el array de accesorios
     if (Array.isArray(response.data)) {
         // Simular filtrado por nombre en el frontend si el backend no lo soporta
        const filteredData = response.data.filter((a: any) => 
           a.nombreAccs.toLowerCase().includes(filtros.nombre.toLowerCase())
        );
        return filteredData as AccesorioBodeguero[];
    } else {
        console.error('La respuesta de /gt/accesoriosBodeguero no es un array:', response.data);
        return [];
    }

  } catch (error: any) {
    console.error('Error cargando mis accesorios:', error);
    // TODO: Manejar el error de forma más amigable
    throw error;
  }
  
  /*
  // --- Código mockeado anterior (comentado) ---
  console.log('Simulando llamada a /accesoriosBodeguero con filtros:', filtros);
  const mockAccesorios: AccesorioBodeguero[] = [
// ... existing code ...
  return mockAccesorios.filter(a => 
    a.nombreAccs.toLowerCase().includes(filtros.nombre?.toLowerCase() || '')
  );
  // --- Fin código mockeado anterior ---
  */
};

export default function MisAccesoriosScreen() {
  const [accesorios, setAccesorios] = useState<AccesorioBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '' }); // Filtro básico de nombre

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
     const fetchMisAccesorios = async () => {
      setLoading(true);
      try {
        const data = await obtenerMisAccesorios(filtros);
        setAccesorios(data);
      } catch (error: any) {
         Alert.alert('Error', error.msg || 'Error al cargar mis accesorios');
         setAccesorios([]); // Limpiar lista en caso de error
      } finally {
        setLoading(false);
      }
    };
    fetchMisAccesorios();
  }, [filtros]); // Dependencia en filtros para recargar al cambiar nombre

  // Función para mostrar el modal de códigos de barras
  const handleVerCodigosBarras = useCallback((codigos: string[], titulo: string) => {
    console.log('Abriendo modal para códigos:', codigos);
    setCodigosBarras(codigos);
    setModalTitle(titulo);
    setModalVisible(true);
  }, []);

  const renderAccesorio = ({ item }: { item: AccesorioBodeguero }) => {
    // Acceso más directo al campo codigosBarrasAccs
    const codigoDeBarras = item.codigoBarrasAccs;
    console.log('Valor de codigoDeBarras en renderAccesorio (después de leer item.codigoBarrasAccs):', codigoDeBarras);

    // Construir el array de códigos de barras a pasar. Asegurarse de que sea un array y que el valor no sea undefined/null.
    // Usamos la variable local codigoDeBarras
    const codigosParaModal = codigoDeBarras ? [codigoDeBarras] : ['No hay código de barras disponible'];

    return (
      <View style={styles.row}>
        <Text style={styles.cell}>Accesorio</Text>
        <Text style={styles.cell}>{item.codigoModeloAccs}</Text>
        <Text style={styles.cell}>{item.nombreAccs}</Text>
        {/* Mostrar 1 como cantidad para cada accesorio individual */}
        <Text style={styles.cell}>1</Text>
        {/* Llamar directamente a la función de manejo del clic */}
        <TouchableOpacity onPress={() => handleVerCodigosBarras(codigosParaModal, `Código de Barras de ${item.nombreAccs}`)} style={styles.codesIcon}>
          <MaterialIcons name="visibility" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
       {/* Filtros (similar a Mis Productos) */}
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

      {/* Lista de accesorios */}
      <FlatList
        data={accesorios}
        renderItem={renderAccesorio}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={() =>
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No has registrado accesorios</Text> : null
        }
         // TODO: Implementar lógica de loading indicator si es necesario
        // refreshing={loading}
        // onRefresh={cargarMisAccesorios}
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