import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// TODO: Importar la API service para accesorios
// import { accesorioService } from '../../services/api';

// TODO: Definir la interfaz del accesorio según el endpoint /accesoriosBodeguero
interface AccesorioBodeguero {
  _id: string;
  codigoModeloAccs: string;
  nombreAccs: string;
  cantidad: number;
  codigosBarras: string[]; // Asumiendo que el endpoint devuelve los códigos de barras directamente
  // Otros campos si son necesarios
}

// TODO: Implementar la llamada al endpoint /accesoriosBodeguero con filtros si es necesario
const obtenerMisAccesorios = async (filtros: any): Promise<AccesorioBodeguero[]> => {
  console.log('Simulando llamada a /accesoriosBodeguero con filtros:', filtros);
  // **Aquí iría la llamada a la API**
  // Ejemplo: const data = await accesorioService.obtenerAccesoriosBodeguero(filtros);
  // return data;

  // Datos mockeados para pruebas (reemplazar con la llamada real)
  const mockAccesorios: AccesorioBodeguero[] = [
    {
      _id: 'acc1',
      codigoModeloAccs: 'EST11',
      nombreAccs: 'Estuche iPhone 11',
      cantidad: 2,
      codigosBarras: ['CBA001', 'CBA002'],
    },
    {
      _id: 'acc2',
      codigoModeloAccs: 'ACCS1234',
      nombreAccs: 'Cargador rápido 20w',
      cantidad: 1,
      codigosBarras: ['CBA003'],
    },
  ];

   // Simular filtrado básico por nombre (ajustar según los filtros reales)
  return mockAccesorios.filter(a => 
    a.nombreAccs.toLowerCase().includes(filtros.nombre?.toLowerCase() || '')
  );
};

export default function MisAccesoriosScreen() {
  const [accesorios, setAccesorios] = useState<AccesorioBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '' }); // Filtro básico de nombre

  const cargarMisAccesorios = async () => {
    setLoading(true);
    try {
      const data = await obtenerMisAccesorios(filtros);
      setAccesorios(data);
    } catch (error) {
      console.error('Error cargando mis accesorios:', error);
      // TODO: Mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisAccesorios();
  }, [filtros]); // Recargar al cambiar filtros

  const verCodigosBarras = (codigos: string[], titulo: string) => {
    setCodigosBarras(codigos);
    setModalTitle(titulo);
    setModalVisible(true);
  };

  const renderAccesorio = ({ item }: { item: AccesorioBodeguero }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>Accesorio</Text>
      <Text style={styles.cell}>{item.codigoModeloAccs}</Text>
      <Text style={styles.cell}>{item.nombreAccs}</Text>
      <Text style={styles.cell}>{item.cantidad}</Text>
      <TouchableOpacity onPress={() => verCodigosBarras(item.codigosBarras, `Códigos de Barras de ${item.nombreAccs}`)} style={styles.codesIcon}>
        <MaterialIcons name="visibility" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

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