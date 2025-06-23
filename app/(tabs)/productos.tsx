import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { stockService } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import CategoriaSelector from '../../components/CategoriaSelector';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DetalleModal from '../../components/DetalleModal';

const VerProductosScreen = () => {
  const initialFilters = { nombre: '', capacidad: '', categoria: '' };
  const [filtros, setFiltros] = useState(initialFilters);
  const [productos, setProductos] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState({});
  const insets = useSafeAreaInsets();

  const obtenerStock = async (currentFilters: typeof initialFilters) => {
    setLoading(true);
    try {
      const params = { ...currentFilters };
      if (!params.categoria) {
        delete (params as any).categoria;
      }
      
      console.log('Solicitando stock con filtros:', JSON.stringify(params, null, 2));
      const data = await stockService.obtenerStockDisponible(params);
      console.log('Datos recibidos del stockService:', JSON.stringify(data, null, 2));

      setProductos(data.productos || []);
      setAccesorios(data.accesorios || []);
    } catch (error: any) {
      alert(error.msg || 'Error al obtener el stock');
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      setFiltros(initialFilters);
      obtenerStock(initialFilters);
    }, [])
  );

  const handleFiltrar = () => {
    obtenerStock(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros(initialFilters);
    obtenerStock(initialFilters);
  };

  const verCodigosBarras = (codigos: string[], nombre: string) => {
    setModalDetails({
      'Códigos de Barras': codigos.join('\n') || 'N/A',
    });
    setModalVisible(true);
  };

  const hasActiveFilters =
    filtros.nombre !== '' || filtros.capacidad !== '' || filtros.categoria !== '';

  const renderProducto = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 1.5 }]}>{item.tipo}</Text>
      <Text style={[styles.cell, { flex: 2.5 }]}>{item.codigoModelo}</Text>
      <Text style={[styles.cell, { flex: 3 }]}>{item.nombreEquipo}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.color}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.capacidad}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.cantidad}</Text>
      <TouchableOpacity style={styles.cell} onPress={() => verCodigosBarras(item.codigoB, item.nombreEquipo)}>
        <MaterialIcons name="visibility" size={24} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
  );

  const renderAccesorio = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 2 }]}>Accesorio</Text>
      <Text style={[styles.cell, { flex: 3 }]}>{item.codigoModeloAccs}</Text>
      <Text style={[styles.cell, { flex: 4 }]}>{item.nombreAccs}</Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.cantidad}</Text>
      <TouchableOpacity style={styles.cell} onPress={() => verCodigosBarras(item.codigosBarras, item.nombreAccs)}>
        <MaterialIcons name="visibility" size={24} color={Colors.light.text} />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = (columns: { name: string; flex: number }[]) => (
    <View style={styles.headerRow}>
      {columns.map(col => <Text key={col.name} style={[styles.headerCell, { flex: col.flex }]}>{col.name}</Text>)}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.filtros}>
        <TextInput
          style={[styles.input, { flex: 1.5 }]}
          placeholder="Nombre"
          placeholderTextColor={Colors.light.placeholder}
          value={filtros.nombre}
          onChangeText={text => setFiltros({ ...filtros, nombre: text })}
        />
        <TextInput
          style={[styles.input, { flex: 1.5 }]}
          placeholder="Capacidad"
          placeholderTextColor={Colors.light.placeholder}
          value={filtros.capacidad}
          onChangeText={text => setFiltros({ ...filtros, capacidad: text })}
        />
        <View style={[styles.categoriaSelectorWrapper, { flex: 2 }]}>
          <CategoriaSelector
            value={filtros.categoria}
            onChange={value => setFiltros({ ...filtros, categoria: value })}
          />
        </View>
        <TouchableOpacity style={styles.botonFiltrar} onPress={handleFiltrar}>
          <Text style={styles.botonFiltrarTexto}>Filtrar</Text>
        </TouchableOpacity>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.botonLimpiar} onPress={handleLimpiarFiltros}>
            <MaterialIcons name="clear" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Dispositivos</Text>
      {renderHeader([
        { name: 'Tipo', flex: 1.5 },
        { name: 'Código Modelo', flex: 2.5 },
        { name: 'Nombre', flex: 3 },
        { name: 'Color', flex: 2 },
        { name: 'Capacidad', flex: 2 },
        { name: 'Cant.', flex: 1 },
        { name: 'Códigos', flex: 1 },
      ])}
      <FlatList
        style={{ maxHeight: 250 }}
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item, idx) => `prod-${item.codigoModelo}-${idx}`}
        ListEmptyComponent={() =>
          !loading && <Text style={styles.emptyMessage}>No hay productos en stock</Text>
        }
      />

      <Text style={styles.sectionTitle}>Accesorios</Text>
      {renderHeader([
        { name: 'Tipo', flex: 2 },
        { name: 'Código Modelo', flex: 3 },
        { name: 'Nombre', flex: 4 },
        { name: 'Cant.', flex: 2 },
        { name: 'Códigos', flex: 1 },
      ])}
      <FlatList
        style={{ maxHeight: 250 }}
        data={accesorios}
        renderItem={renderAccesorio}
        keyExtractor={(item, idx) => `accs-${item.codigoModeloAccs}-${idx}`}
        ListEmptyComponent={() =>
          !loading && <Text style={styles.emptyMessage}>No hay accesorios en stock</Text>
        }
      />

      {loading && <ActivityIndicator size="large" color={Colors.light.text} style={{ marginTop: 20 }} />}
      
      <DetalleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Códigos de Barras"
        details={modalDetails}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  filtros: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    backgroundColor: Colors.light.card,
    fontSize: 14,
    color: Colors.light.text,
    height: 48,
  },
  categoriaSelectorWrapper: {
    marginRight: 8,
    height: 48,
    justifyContent: 'center',
  },
  botonFiltrar: {
    backgroundColor: Colors.light.button,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
  botonLimpiar: {
    marginLeft: 8,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  botonFiltrarTexto: {
    color: Colors.light.buttonText,
    fontWeight: 'bold',
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 20, 
    marginBottom: 10,
    paddingHorizontal: 16,
    color: Colors.light.text,
  },
  headerRow: { 
    flexDirection: 'row', 
    backgroundColor: Colors.light.card, 
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerCell: { 
    fontWeight: 'bold', 
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.text,
  },
  row: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderColor: Colors.light.border, 
    padding: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cell: { 
    flex: 1, 
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.text,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    color: Colors.light.placeholder,
    padding: 10,
  }
});

export default VerProductosScreen;