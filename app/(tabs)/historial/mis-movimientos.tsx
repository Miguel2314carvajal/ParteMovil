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
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [selectedMovementDetails, setSelectedMovementDetails] = useState<Record<string, string>>({});
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
      setMovements([]);
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
    setSelectedMovement(movement);
    setSelectedMovementDetails({
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

  const handleStartEdit = () => {
    if (!selectedMovement) return;
    setModalVisible(false); // Cierra el modal de detalles
    handleEditObservation(selectedMovement);
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
    <TouchableOpacity onPress={() => handleVerDetalle(item)} style={styles.movementCard}>
      <View style={styles.cardContent}>
        <View style={styles.movementInfo}>
          <Text style={styles.date}>{new Date(item.fecha).toLocaleString()}</Text>
          <Text style={styles.movementDetailText}><Text style={styles.label}>De:</Text> {item.areaSalida || 'N/A'}</Text>
          <Text style={styles.movementDetailText}><Text style={styles.label}>A:</Text> {item.areaLlegada || 'N/A'}</Text>
          
          {(item.productos?.length > 0 || item.accesorios?.length > 0) &&
            <View style={styles.countsContainer}>
              {item.productos?.length > 0 && <Text style={styles.movementDetailText}><Text style={styles.label}>Productos:</Text> {item.productos.length}</Text>}
              {item.accesorios?.length > 0 && <Text style={styles.movementDetailText}><Text style={styles.label}>Accesorios:</Text> {item.accesorios.length}</Text>}
            </View>
          }

          <Text style={styles.observationText} numberOfLines={1}><Text style={styles.label}>Obs:</Text> {item.observacion || 'Sin observación'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.controlsHeader}>
        <View style={styles.filtrosContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker('desde')}
            >
              <MaterialIcons name="calendar-today" size={18} color={Colors.dark.text} style={{marginRight: 5}}/>
              <Text style={styles.datePickerText}>
                {fechaDesde ? fechaDesde.toLocaleDateString('es-ES') : 'Desde'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker('hasta')}
            >
              <MaterialIcons name="calendar-today" size={18} color={Colors.dark.text} style={{marginRight: 5}}/>
              <Text style={styles.datePickerText}>
                {fechaHasta ? fechaHasta.toLocaleDateString('es-ES') : 'Hasta'}
              </Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={exportarPDF}
          disabled={loading}
        >
          <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={
            (showPicker === 'desde' && fechaDesde) ? fechaDesde :
            (showPicker === 'hasta' && fechaHasta) ? fechaHasta :
            new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.dark.text} style={{ marginTop: 50 }}/>
      ) : (
        <FlatList
          data={movements}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => 
            !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay movimientos registrados por ti</Text> : null
          }
        />
      )}

      <DetalleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        details={selectedMovementDetails}
        title="Detalle del Movimiento"
        onEdit={handleStartEdit}
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
    backgroundColor: '#F5F5F5', // Fondo general más claro
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtrosContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  datePickerText: {
    color: '#000',
    fontSize: 14,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  movementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  movementInfo: {
    flex: 1,
  },
  date: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  movementDetailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  label: {
    fontWeight: '600',
    color: '#000',
  },
  observationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
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
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText:{
    fontWeight: 'bold',
  }
}); 