import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Platform,
  Button,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Sharing from 'expo-sharing';
import { Colors } from '@/constants/Colors';
import DetalleModal from '../../../components/DetalleModal';
import { useFocusEffect } from '@react-navigation/native';

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
    // Construir los parámetros de la URL solo si hay fechas válidas
    let url = '/gt/movimientosBodeguero';
    const params = new URLSearchParams();
    
    if (fechaDesde) {
      // Enviar la fecha exactamente como la selecciona el usuario
      params.append('desde', fechaDesde);
    }
    
    if (fechaHasta) {
      // Enviar la fecha exactamente como la selecciona el usuario
      params.append('hasta', fechaHasta);
    }

    // Añadir los parámetros a la URL si existen
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    console.log('Respuesta completa de /gt/movimientosBodeguero:', response.data);

    if (Array.isArray(response.data)) {
      return response.data as Movement[];
    } else {
      console.error('La respuesta de /gt/movimientosBodeguero no es un array:', response.data);
      return [];
    }

  } catch (error: any) {
    console.error('Error al obtener mis movimientos:', error);
    if (error.response && error.response.status === 403) {
      Alert.alert('Error de Acceso', 'No tienes permiso para ver estos movimientos.');
    } else {
      Alert.alert('Error', error.message || 'Error al cargar mis movimientos');
    }
    throw error;
  }
};

export default function MisMovimientosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Record<string, string>>({});
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();
  const [showPicker, setShowPicker] = useState<'desde' | 'hasta' | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editObservation, setEditObservation] = useState('');
  const [editMovementId, setEditMovementId] = useState<string | null>(null);

  const fetchMovements = async (desde?: Date, hasta?: Date) => {
    setLoading(true);
    try {
      const desdeISO = desde ? desde.toISOString().split('T')[0] : '';
      const hastaISO = hasta ? hasta.toISOString().split('T')[0] : '';
      const data = await obtenerMisMovimientos(searchQuery, desdeISO, hastaISO);
      setMovements(data);
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setFechaDesde(undefined);
      setFechaHasta(undefined);
      fetchMovements();
    }, [])
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || (showPicker === 'desde' ? fechaDesde : fechaHasta);
    setShowPicker(null);
    if (currentDate) {
      if (showPicker === 'desde') {
        setFechaDesde(currentDate);
        fetchMovements(currentDate, fechaHasta);
      } else if (showPicker === 'hasta') {
        setFechaHasta(currentDate);
        fetchMovements(fechaDesde, currentDate);
      }
    }
  };

  const handleVerDetalle = (movement: Movement) => {
    setSelectedMovement({
      'Fecha': new Date(movement.fecha).toLocaleString(),
      'Responsable': movement.responsable?.[0]?.nombreResponsable || 'N/A',
      'De': movement.areaSalida,
      'A': movement.areaLlegada,
      'Observación': movement.observacion,
      'Productos': (movement.productos || []).map(p => `${p.nombreEquipo} (${p.codigoBarras})`).join('\n') || 'Ninguno',
      'Accesorios': (movement.accesorios || []).map(a => `${a.nombreAccs} (${a.codigoBarrasAccs})`).join('\n') || 'Ninguno',
    });
    setModalVisible(true);
  };

  const handleEditObservation = (movement: Movement) => {
    setEditObservation(movement.observacion || '');
    setEditMovementId(movement._id);
    setEditModalVisible(true);
  };

  const handleSaveObservation = async () => {
    if (!editMovementId) return;
    try {
      await api.put(`/gt/actualizarMovimiento/${editMovementId}`, { observacion: editObservation });
      setEditModalVisible(false);
      setEditMovementId(null);
      setEditObservation('');
      // Refrescar la lista
      const data = await obtenerMisMovimientos(searchQuery, fechaDesde?.toISOString().split('T')[0] || '', fechaHasta?.toISOString().split('T')[0] || '');
      setMovements(data);
      Alert.alert('Éxito', 'Observación actualizada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'No se pudo actualizar la observación');
    }
  };

  const exportarPDF = async () => {
    setLoading(true);
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { text-align: center; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Historial de Movimientos</h1>
            <table>
              <tr>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Área Salida</th>
                <th>Área Llegada</th>
                <th>Observación</th>
                <th>Productos</th>
                <th>Accesorios</th>
              </tr>
              ${movements.map(mov => `
                <tr>
                  <td>${new Date(mov.fecha).toLocaleString()}</td>
                  <td>${mov.responsable?.[0]?.nombreResponsable || ''}</td>
                  <td>${mov.areaSalida}</td>
                  <td>${mov.areaLlegada}</td>
                  <td>${mov.observacion}</td>
                  <td>${(mov.productos || []).map(p => `${p.nombreEquipo} (${p.codigoBarras})`).join('<br/>')}</td>
                  <td>${(mov.accesorios || []).map(a => `${a.nombreAccs} (${a.codigoBarrasAccs})`).join('<br/>')}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: 'historial_movimientos',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('Respuesta de creación de PDF:', JSON.stringify(file, null, 2));

      if (file.filePath) {
        const filePath = file.filePath.startsWith('file://') ? file.filePath : `file://${file.filePath}`;
        await Sharing.shareAsync(filePath);
      } else {
        throw new Error('La creación del PDF no devolvió una ruta de archivo válida.');
      }
    } catch (error: any) {
      console.error("Error detallado al exportar PDF:", error);
      Alert.alert('Error', `No se pudo exportar el PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Movement }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleVerDetalle(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Movimiento</Text>
        <Text style={styles.dateText}>{new Date(item.fecha).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>De:</Text> {item.areaSalida}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>A:</Text> {item.areaLlegada}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Obs:</Text> {item.observacion}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <View style={styles.dateFiltersContainer}>
          <TouchableOpacity style={styles.datePickerInput} onPress={() => setShowPicker('desde')}>
            <MaterialIcons name="date-range" size={20} color={Colors.light.text} />
            <Text style={styles.datePickerText}>{fechaDesde ? fechaDesde.toLocaleDateString() : 'Desde'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.datePickerInput} onPress={() => setShowPicker('hasta')}>
            <MaterialIcons name="date-range" size={20} color={Colors.light.text} />
            <Text style={styles.datePickerText}>{fechaHasta ? fechaHasta.toLocaleDateString() : 'Hasta'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={exportarPDF} disabled={loading}>
          <MaterialIcons name="picture-as-pdf" size={20} color={Colors.light.buttonText} />
          <Text style={styles.buttonText}>Exportar</Text>
        </TouchableOpacity>
      </View>
      
      {showPicker && (
        <DateTimePicker
          value={(showPicker === 'desde' ? fechaDesde : fechaHasta) || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.text} style={{ marginTop: 50 }}/>
      ) : (
        <FlatList
          data={movements}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay movimientos registrados por ti.</Text>
            </View>
          )}
        />
      )}

      <DetalleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Detalle del Movimiento"
        details={selectedMovement}
      />

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Observación</Text>
            <TextInput
              value={editObservation}
              onChangeText={setEditObservation}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Ingrese la nueva observación"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity onPress={handleSaveObservation} style={[styles.saveButton, { flex: 1, marginRight: 8 }]}> 
                <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.cancelButton, { flex: 1, marginLeft: 8 }]}> 
                <Text style={{ color: '#007AFF', fontWeight: 'bold', textAlign: 'center' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateFiltersContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  datePickerInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  datePickerText: {
    color: Colors.light.text,
    marginLeft: 8,
    fontSize: 14,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.button,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.light.buttonText,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.placeholder,
  },
  cardBody: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.placeholder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
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
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    fontSize: 16,
    marginBottom: 8,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.text,
    padding: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.text,
    padding: 12,
    borderRadius: 8,
  },
}); 