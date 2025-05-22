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
  fechaIngresoAccs: string; // Asumiendo un campo de fecha de ingreso para accesorios
  locacionAccs: string;
  nombreAccs: string;
  precioAccs: number; // O string, dependiendo de la API
  responsableAccs: any[]; // Puedes refinar esto también
}

// Implementación real para obtener accesorios del bodeguero
// TODO: Modificar para aceptar filtros de fecha si el backend lo soporta, si no, filtrar en frontend
const obtenerMisAccesorios = async (filtros: { nombre: string, fechaDesde: string, fechaHasta: string }): Promise<AccesorioBodeguero[]> => {
  console.log('Llamando a /gt/accesoriosBodeguero con filtros:', filtros);
  try {
    // TODO: Asegurarse de que el endpoint /gt/accesoriosBodeguero soporte filtrado por nombre y fecha
    // Si soporta, pasar el filtro como parámetro: `/gt/accesoriosBodeguero?nombre=${filtros.nombre}&desde=${filtros.fechaDesde}&hasta=${filtros.fechaHasta}`
    // TODO: Confirmar si la ruta de bodeguero soporta filtros de fecha. Por ahora, llamamos sin filtros y filtramos en frontend.
    const response = await api.get('/gt/accesoriosBodeguero'); // Llamada a la API para bodegueros
     console.log('Respuesta completa de /gt/accesoriosBodeguero:', response.data); // Log para depuración

    // TODO: Verificar la estructura exacta de la respuesta y ajustarla si es necesario
    // Asumiendo que response.data contiene directamente el array de accesorios
     if (Array.isArray(response.data)) {
         // Simular filtrado por nombre y fecha en el frontend si el backend no lo soporta
        const filteredData = response.data.filter((a: any) => {
           const nombreMatch = a.nombreAccs.toLowerCase().includes(filtros.nombre.toLowerCase());

           // TODO: Implementar lógica de filtrado por fecha para accesorios
           // Asegurarnos de que item.fechaIngresoAccs exista y sea una fecha válida
           const fechaAccesorio = a.fechaIngresoAccs ? new Date(a.fechaIngresoAccs) : null; // Usando fechaIngresoAccs
           let fechaDesdeObj = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
           let fechaHastaObj = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

           let fechaMatch = true;
            if (fechaDesdeObj && fechaAccesorio && fechaAccesorio < fechaDesdeObj) {
               fechaMatch = false;
           }
           // Añadir 23 horas, 59 minutos y 59 segundos a la fecha hasta para incluir todo el día
           if (fechaHastaObj) {
              fechaHastaObj.setHours(23, 59, 59, 999);
           }
           if (fechaHastaObj && fechaAccesorio && fechaAccesorio > fechaHastaObj) {
               fechaMatch = false;
           }

           return nombreMatch && fechaMatch; // Aplicar ambos filtros (nombre y fecha)
        });
        return filteredData as AccesorioBodeguero[];
    } else {
        console.error('La respuesta de /gt/accesoriosBodeguero no es un array:', response.data);
        return [];
    }

  } catch (error: any) {
    console.error('Error cargando mis accesorios:', error);
    // TODO: Manejar el error de forma más amigable
    // Si el error es 403, mostrar un mensaje específico
    if (error.response && error.response.status === 403) {
        Alert.alert('Error de Acceso', 'No tienes permiso para ver estos accesorios.');
    } else {
        Alert.alert('Error', error.message || 'Error al cargar mis accesorios');
    }
    throw error; // Re-lanzar el error para que el caller lo maneje si es necesario
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
  const [filtros, setFiltros] = useState({ nombre: '', fechaDesde: '', fechaHasta: '' }); // Añadir filtros de fecha

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
  }, [filtros]); // Dependencia en filtros para recargar al cambiar nombre o fechas

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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
    height: 40,
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  codesIcon: {
    paddingHorizontal: 10,
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
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 