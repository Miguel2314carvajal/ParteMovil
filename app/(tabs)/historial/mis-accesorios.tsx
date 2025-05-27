import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api'; // Ajustar la ruta si es diferente
import DateTimePicker from '@react-native-community/datetimepicker';
import { visualizacionService } from '../../../services/api';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Sharing from 'expo-sharing';

// TODO: Definir la interfaz del accesorio según el endpoint /accesoriosBodeguero si es diferente
interface AccesorioBodeguero {
  _id: string;
  __v: number;
  categoriaNombre: any[]; // Volvemos a any[] porque la estructura exacta no está clara
  codigoBarrasAccs: string; // Este es el campo que buscamos
  codigoModeloAccs: string;
  disponibilidadAccs: string;
  fechaIngresoAccs: string; // Asumiendo un campo de fecha de ingreso para accesorios
  locacionAccs: string;
  nombreAccs: string;
  precioAccs: number; // O string, dependiendo de la API
  responsableAccs: any[]; // Puedes refinar esto también
  color?: string;
  capacidad?: string;
  cantidad?: number; // Lo mantenemos pero lo mostraremos como 1 si no viene del backend
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

  return (
    <View style={styles.container}>
      {/* Botón de Exportar PDF */}
      <TouchableOpacity 
        style={styles.exportButton} 
        onPress={async () => {
          try {
            const filas = await Promise.all(accesorios.map(async (a: any) => {
              const base64 = await getBarcodeBase64(a.codigoBarrasAccs);
              return `
                <tr>
                  <td>Accesorio</td>
                  <td>${a.codigoModeloAccs}</td>
                  <td>${a.nombreAccs}</td>
                  <td>${a.cantidad || 1}</td>
                  <td>
                    <div style="text-align:center;">
                      <img src="data:image/png;base64,${base64}" style="width:120px; height:40px;" />
                    </div>
                  </td>
                </tr>
              `;
            }));

            const htmlContent = `
              <h1>Listado de Accesorios</h1>
              <table border="1" style="width:100%; border-collapse: collapse;">
                <tr>
                  <th>Tipo</th>
                  <th>Código Modelo</th>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Código de Barras</th>
                </tr>
                ${filas.join('')}
              </table>
            `;

            const options = {
              html: htmlContent,
              fileName: 'accesorios',
              directory: 'Documents',
            };

            const file = await RNHTMLtoPDF.convert(options);
            const filePath = file.filePath.startsWith('file://') ? file.filePath : 'file://' + file.filePath;
            await Sharing.shareAsync(filePath);
          } catch (error) {
            console.error('Error al exportar PDF:', error);
            Alert.alert('Error', 'No se pudo exportar el PDF');
          }
        }}
      >
        <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
        <Text style={styles.exportButtonText}>Exportar a PDF</Text>
      </TouchableOpacity>
      {/* Filtros (similar a Mis Productos) */}
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
        <Text style={styles.headerCell}>Cantidad</Text>
        <Text style={styles.headerCell}>Códigos</Text>
      </View>
      {/* Lista de accesorios */}
      <FlatList
        data={accesorios}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>Accesorio</Text>
            <Text style={styles.cell}>{item.codigoModeloAccs}</Text>
            <Text style={styles.cell}>{item.nombreAccs}</Text>
            <Text style={styles.cell}>{item.cantidad || 1}</Text>
            <TouchableOpacity onPress={() => handleVerCodigosBarras([item.codigoBarrasAccs], `Código de Barras de ${item.nombreAccs}`)} style={styles.codesIcon}>
              <MaterialIcons name="visibility" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={() =>
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No has registrado accesorios</Text> : null
        }
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 6,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#222',
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