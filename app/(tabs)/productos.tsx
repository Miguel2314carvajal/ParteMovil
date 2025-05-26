import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { stockService } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import CategoriaSelector from '../../components/CategoriaSelector';
import { useFocusEffect } from '@react-navigation/native';

const VerProductosScreen = () => {
  const [filtros, setFiltros] = useState({ nombre: '', capacidad: '', categoria: '' });
  const [productos, setProductos] = useState([]);
  const [accesorios, setAccesorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigosBarras, setCodigosBarras] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');

  const obtenerStock = async () => {
    setLoading(true);
    try {
      const data = await stockService.obtenerStockDisponible(filtros);
      setProductos(data.productos || []);
      setAccesorios(data.accesorios || []);
    } catch (error: any) {
      alert(error.msg || 'Error al obtener el stock');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      obtenerStock();
    }, [])
  );

  const handleFiltrar = () => {
    obtenerStock();
  };

  const verCodigosBarras = (codigos: string[], titulo: string) => {
    setCodigosBarras(codigos);
    setModalTitle(titulo);
    setModalVisible(true);
  };

  const renderProducto = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.tipo}</Text>
      <Text style={styles.cell}>{item.codigoModelo}</Text>
      <Text style={styles.cell}>{item.nombreEquipo}</Text>
      <Text style={styles.cell}>{item.color}</Text>
      <Text style={styles.cell}>{item.capacidad}</Text>
      <Text style={styles.cell}>{item.cantidad}</Text>
      <TouchableOpacity onPress={() => verCodigosBarras(item.codigoB, `Códigos de Barras de ${item.nombreEquipo}`)}>
        <MaterialIcons name="visibility" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderAccesorio = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>Accesorio</Text>
      <Text style={styles.cell}>{item.codigoModeloAccs}</Text>
      <Text style={styles.cell}>{item.nombreAccs}</Text>
      <Text style={styles.cell}>{item.cantidad}</Text>
      <TouchableOpacity onPress={() => verCodigosBarras(item.codigosBarras, `Códigos de Barras de ${item.nombreAccs}`)}>
        <MaterialIcons name="visibility" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filtros}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={filtros.nombre}
          onChangeText={text => setFiltros({ ...filtros, nombre: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Capacidad"
          value={filtros.capacidad}
          onChangeText={text => setFiltros({ ...filtros, capacidad: text })}
        />
        <View style={styles.categoriaSelectorWrapper}>
          <CategoriaSelector
            value={filtros.categoria}
            onChange={value => setFiltros({ ...filtros, categoria: value })}
          />
        </View>
        <TouchableOpacity style={styles.botonFiltrar} onPress={handleFiltrar}>
          <Text style={{ color: 'white' }}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* Productos */}
      <Text style={styles.sectionTitle}>Dispositivos</Text>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Tipo</Text>
        <Text style={styles.headerCell}>Código Modelo</Text>
        <Text style={styles.headerCell}>Nombre</Text>
        <Text style={styles.headerCell}>Color</Text>
        <Text style={styles.headerCell}>Capacidad</Text>
        <Text style={styles.headerCell}>Cantidad</Text>
        <Text style={styles.headerCell}>Códigos</Text>
      </View>
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item, idx) => item.codigoModelo + idx}
        ListEmptyComponent={() =>
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay productos en stock</Text> : null
        }
      />

      {/* Accesorios */}
      <Text style={styles.sectionTitle}>Accesorios</Text>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Tipo</Text>
        <Text style={styles.headerCell}>Código Modelo</Text>
        <Text style={styles.headerCell}>Nombre</Text>
        <Text style={styles.headerCell}>Cantidad</Text>
        <Text style={styles.headerCell}>Códigos</Text>
      </View>
      <FlatList
        data={accesorios}
        renderItem={renderAccesorio}
        keyExtractor={(item, idx) => item.codigoModeloAccs + idx}
        ListEmptyComponent={() =>
          !loading ? <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay accesorios en stock</Text> : null
        }
      />

      {/* Modal para mostrar los códigos de barras */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            width: '80%',
            maxHeight: '70%'
          }}>
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
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  filtros: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    minWidth: 80,
    marginRight: 8,
    backgroundColor: '#fff',
    height: 40,
  },
  categoriaSelectorWrapper: {
    minWidth: 120,
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
  },
  botonFiltrar: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  headerRow: { flexDirection: 'row', backgroundColor: '#eee', paddingVertical: 8 },
  headerCell: { flex: 1, fontWeight: 'bold', textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8 },
  cell: { flex: 1, textAlign: 'center' },
});

export default VerProductosScreen;