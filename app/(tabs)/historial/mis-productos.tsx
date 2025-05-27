import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api'; // Ajustar la ruta si es diferente
import DateTimePicker from '@react-native-community/datetimepicker';
import { visualizacionService } from '../../../services/api';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Sharing from 'expo-sharing';

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
const obtenerMisProductos = async (filtros: { nombre: string, fechaDesde: string, fechaHasta: string }): Promise<ProductoBodeguero[]> => {
  console.log('Llamando a /gt/productosBodeguero con filtros:', filtros);
  try {
    const response = await visualizacionService.listarProductosPorFecha(filtros.fechaDesde, filtros.fechaHasta);
    console.log('Respuesta completa de /gt/productosBodeguero:', response);

    if (Array.isArray(response)) {
      const filteredData = response.filter((p: any) => {
        const nombreMatch = p.nombreEquipo.toLowerCase().includes(filtros.nombre.toLowerCase());
        return nombreMatch;
      });
      return filteredData as ProductoBodeguero[];
    } else {
      console.error('La respuesta de /gt/productosBodeguero no es un array:', response);
      return [];
    }
  } catch (error: any) {
    console.error('Error cargando mis productos:', error);
    if (error.response && error.response.status === 403) {
      Alert.alert('Error de Acceso', 'No tienes permiso para ver estos productos.');
    } else {
      Alert.alert('Error', error.message || 'Error al cargar mis productos');
    }
    throw error;
  }
};

async function getBarcodeBase64(code: string): Promise<string> {
  const url = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${code}&includetext`;
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // El resultado es data:image/png;base64,xxxxxx
      const base64data = reader.result?.toString().split(',')[1] || '';
      resolve(base64data);
    };
    reader.readAsDataURL(blob);
  });
}

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<ProductoBodeguero[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [filtros, setFiltros] = useState({ nombre: '', fechaDesde: '', fechaHasta: '' }); // Añadir filtros de fecha
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);

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
    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.tipo}</Text>
        <Text style={styles.cell}>{item.codigoModelo}</Text>
        <Text style={styles.cell}>{item.nombreEquipo}</Text>
        <Text style={styles.cell}>{item.color || 'N/A'}</Text>
        <Text style={styles.cell}>{item.capacidad || 'N/A'}</Text>
        <Text style={styles.cell}>1</Text>
        <TouchableOpacity onPress={() => verCodigosBarras([item.codigoBarras], `Código de Barras de ${item.nombreEquipo}`)} style={styles.codesIcon}>
          <MaterialIcons name="visibility" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const exportarPDF = async () => {
    try {
      const filas = await Promise.all(productos.map(async (p) => {
        const base64 = await getBarcodeBase64(p.codigoBarras);
        return `
          <tr>
            <td>${p.tipo}</td>
            <td>${p.codigoModelo}</td>
            <td>${p.nombreEquipo}</td>
            <td>${p.color || 'N/A'}</td>
            <td>${p.capacidad || 'N/A'}</td>
            <td>1</td>
            <td>
              <div style="text-align:center;">
                <img src="data:image/png;base64,${base64}" style="width:120px; height:40px;" />
              </div>
            </td>
          </tr>
        `;
      }));

      const htmlContent = `
        <h1>Listado de Dispositivos</h1>
        <table border="1" style="width:100%; border-collapse: collapse;">
          <tr>
            <th>Tipo</th>
            <th>Código Modelo</th>
            <th>Nombre</th>
            <th>Color</th>
            <th>Capacidad</th>
            <th>Cantidad</th>
            <th>Código de Barras</th>
          </tr>
          ${filas.join('')}
        </table>
      `;
      const options = {
        html: htmlContent,
        fileName: 'dispositivos',
        directory: 'Documents',
      };
      const file = await RNHTMLtoPDF.convert(options);
      const filePath = file.filePath.startsWith('file://') ? file.filePath : 'file://' + file.filePath;
      await Sharing.shareAsync(filePath);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      Alert.alert('Error', 'No se pudo exportar el PDF');
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de Exportar PDF */}
      <TouchableOpacity style={styles.exportButton} onPress={exportarPDF}>
        <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
        <Text style={styles.exportButtonText}>Exportar a PDF</Text>
      </TouchableOpacity>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        <View style={styles.dateInputsContainer}>
          {/* Fecha Desde */}
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDesdePicker(true)}
          >
            <Text style={{ color: filtros.fechaDesde ? '#000' : '#888', fontSize: 16 }}>
              {filtros.fechaDesde ? filtros.fechaDesde : 'Desde'}
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
            <Text style={{ color: filtros.fechaHasta ? '#000' : '#888', fontSize: 16 }}>
              {filtros.fechaHasta ? filtros.fechaHasta : 'Hasta'}
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
  headerRow: { flexDirection: 'row', backgroundColor: '#f8f8f8', paddingVertical: 10, marginBottom: 8, borderRadius: 8, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  headerCell: { flex: 1, fontWeight: 'bold', textAlign: 'center', fontSize: 15, color: '#333' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, marginBottom: 6 },
  cell: { flex: 1, textAlign: 'center', fontSize: 15, color: '#222' },
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
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
}); 