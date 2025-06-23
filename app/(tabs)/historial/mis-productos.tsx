import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { visualizacionService } from '../../../services/api';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Sharing from 'expo-sharing';
import { Colors } from '@/constants/Colors';
import DetalleModal from '../../../components/DetalleModal';
import { useFocusEffect } from '@react-navigation/native';

// TODO: Definir la interfaz del producto según el endpoint /productosBodeguero si es diferente
interface ProductoBodeguero {
  _id: string;
  tipo: string;
  codigoModelo: string;
  nombreEquipo: string;
  codigoBarras: string;
  color?: string;
  capacidad?: string;
  fechaIngreso: string;
}

async function getBarcodeBase64(code: string): Promise<string> {
  try {
    const url = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${code}&includetext`;
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error generating barcode:", error);
    return ''; 
  }
}

export default function MisProductosScreen() {
  const [productos, setProductos] = useState<ProductoBodeguero[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Record<string, string>>({});
  const [modalTitle, setModalTitle] = useState('');
  
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();
  const [showPicker, setShowPicker] = useState<'desde' | 'hasta' | null>(null);

  const fetchMisProductos = async (desde?: Date, hasta?: Date) => {
    setLoading(true);
    try {
      const desdeISO = desde?.toISOString().split('T')[0] || '';
      const hastaISO = hasta?.toISOString().split('T')[0] || '';
      const data = await visualizacionService.listarProductosPorFecha(desdeISO, hastaISO);
      setProductos(data);
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'Error al cargar los dispositivos');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setFechaDesde(undefined);
      setFechaHasta(undefined);
      fetchMisProductos();
    }, [])
  );

  useEffect(() => {
    fetchMisProductos(fechaDesde, fechaHasta);
  }, [fechaDesde, fechaHasta]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || (showPicker === 'desde' ? fechaDesde : fechaHasta);
    setShowPicker(null);
    if (currentDate) {
      if (showPicker === 'desde') {
        setFechaDesde(currentDate);
      }
      if (showPicker === 'hasta') {
        setFechaHasta(currentDate);
      }
    }
  };
  
  const handleVerDetalle = (producto: ProductoBodeguero) => {
    setModalTitle(`${producto.nombreEquipo}`);
    setSelectedProduct({
      'Código de Barras': producto.codigoBarras,
    });
    setModalVisible(true);
  };
  
  const exportarPDF = async () => {
    setLoading(true);
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
            <td><img src="${base64}" style="width:120px; height:auto;" /></td>
          </tr>
        `;
      }));

      const htmlContent = `
        <html>
          <head><style> table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } </style></head>
          <body>
            <h1>Listado de Dispositivos</h1>
            <table>
              <tr><th>Tipo</th><th>Código Modelo</th><th>Nombre</th><th>Color</th><th>Capacidad</th><th>Código de Barras</th></tr>
              ${filas.join('')}
            </table>
          </body>
        </html>`;

      const options = { html: htmlContent, fileName: 'mis_dispositivos', directory: 'Documents' };
      const file = await RNHTMLtoPDF.convert(options);
      
      if (file.filePath) {
        const filePath = file.filePath.startsWith('file://') ? file.filePath : `file://${file.filePath}`;
        await Sharing.shareAsync(filePath);
      } else {
        throw new Error('La creación del PDF no devolvió una ruta de archivo válida.');
      }
    } catch (error: any) {
      Alert.alert('Error', `No se pudo exportar el PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, { flex: 1.5 }]}>Tipo</Text>
      <Text style={[styles.headerCell, { flex: 2.5 }]}>Modelo</Text>
      <Text style={[styles.headerCell, { flex: 3 }]}>Nombre</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Color</Text>
      <Text style={[styles.headerCell, { flex: 2 }]}>Capacidad</Text>
      <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Cant.</Text>
      <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Ver</Text>
    </View>
  );

  const renderItem = ({ item }: { item: ProductoBodeguero }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 1.5 }]}>{item.tipo}</Text>
      <Text style={[styles.cell, { flex: 2.5 }]}>{item.codigoModelo}</Text>
      <Text style={[styles.cell, { flex: 3 }]}>{item.nombreEquipo}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.color || 'N/A'}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.capacidad || 'N/A'}</Text>
      <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>1</Text>
      <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => handleVerDetalle(item)}>
        <MaterialIcons name="visibility" size={22} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
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

      {renderHeader()}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.text} style={{ flex: 1 }}/>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={() => <Text style={styles.emptyText}>No se encontraron dispositivos con los filtros seleccionados.</Text>}
        />
      )}

      <DetalleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        details={selectedProduct}
      />
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
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    fontWeight: 'bold',
    color: Colors.light.text,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: Colors.light.divider,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
  },
  cell: {
    color: Colors.light.text,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.light.placeholder,
    padding: 16,
    backgroundColor: Colors.light.card,
  },
}); 