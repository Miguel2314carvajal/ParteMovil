import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api'; // Ajustar la ruta si es diferente
import DateTimePicker from '@react-native-community/datetimepicker';
import { visualizacionService } from '../../../services/api';

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
const obtenerMisAccesorios = async (filtros: { nombre: string, fechaDesde: string, fechaHasta: string }): Promise<AccesorioBodeguero[]> => {
  console.log('Llamando a /gt/accesoriosBodeguero con filtros:', filtros);
  try {
    const response = await visualizacionService.listarAccesoriosPorFecha(filtros.fechaDesde, filtros.fechaHasta);
    console.log('Respuesta completa de /gt/accesoriosBodeguero:', response);

    if (Array.isArray(response)) {
      const filteredData = response.filter((a: any) => {
        const nombreMatch = a.nombreAccs.toLowerCase().includes(filtros.nombre.toLowerCase());
        return nombreMatch;
      });
      return filteredData as AccesorioBodeguero[];
    } else {
      console.error('La respuesta de /gt/accesoriosBodeguero no es un array:', response);
      return [];
    }
  } catch (error: any) {
    console.error('Error cargando mis accesorios:', error);
    if (error.response && error.response.status === 403) {
      Alert.alert('Error de Acceso', 'No tienes permiso para ver estos accesorios.');
    } else {
      Alert.alert('Error', error.message || 'Error al cargar mis accesorios');
    }
    throw error;
  }
};

export default function MisAccesoriosScreen() {
  const [accesorios, setAccesorios] = useState<AccesorioBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '', fechaDesde: '', fechaHasta: '' }); // Añadir filtros de fecha
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);

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
          <View style={styles.dateInputsContainer}>
            {/* Fecha Desde */}
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDesdePicker(true)}
            >
              <Text style={{ color: filtros.fechaDesde ? '#000' : '#888' }}>
                {filtros.fechaDesde ? filtros.fechaDesde : 'Selecciona fecha desde'}
              </Text>
            </TouchableOpacity>
            {showDesdePicker && (
              <DateTimePicker
                value={filtros.fechaDesde ? new Date(filtros.fechaDesde + 'T00:00:00') : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDesdePicker(false);
                  if (selectedDate) {
                    // Ajustar la fecha para evitar el desfase de zona horaria
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const fecha = `${year}-${month}-${day}`;
                    setFiltros({ ...filtros, fechaDesde: fecha });
                  }
                }}
              />
            )}

            {/* Fecha Hasta */}
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowHastaPicker(true)}
            >
              <Text style={{ color: filtros.fechaHasta ? '#000' : '#888' }}>
                {filtros.fechaHasta ? filtros.fechaHasta : 'Selecciona fecha hasta'}
              </Text>
            </TouchableOpacity>
            {showHastaPicker && (
              <DateTimePicker
                value={filtros.fechaHasta ? new Date(filtros.fechaHasta + 'T00:00:00') : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowHastaPicker(false);
                  if (selectedDate) {
                    // Ajustar la fecha para evitar el desfase de zona horaria
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const fecha = `${year}-${month}-${day}`;
                    setFiltros({ ...filtros, fechaHasta: fecha });
                  }
                }}
              />
            )}
          </View>
          {/* Botón Filtrar */}
          <TouchableOpacity 
            style={styles.filterButton}
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
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
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