import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text, TextInput, ActivityIndicator, Modal } from 'react-native';
import EscanerCodigoBarras from './EscanerCodigoBarras';
import { stockService, movimientoService } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import SimpleSelector from './SimpleSelector';
import { Colors } from '@/constants/Colors';

interface Producto {
  codigoBarras: string;
  nombreEquipo: string;
  capacidad: string;
  color: string;
  codigoSerial: string;
}

interface Accesorio {
  codigoBarrasAccs: string;
  nombreAccs: string;
}

export default function MovimientoForm() {
  const [mostrarEscaner, setMostrarEscaner] = useState(false);
  const [tipoEscaner, setTipoEscaner] = useState<'producto' | 'accesorio'>('producto');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [accesorios, setAccesorios] = useState<Accesorio[]>([]);
  const [areaLlegada, setAreaLlegada] = useState('');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<{ label: string; value: string }[]>([]);

  const cargarAreas = async () => {
    try {
      const areasUnicas = await movimientoService.obtenerAreasUnicas();
      const formattedAreas = areasUnicas.map((area: string) => ({ label: area, value: area }));
      setAreas(formattedAreas);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      Alert.alert('Error', 'No se pudieron cargar las áreas de llegada');
    }
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  const handleCodigoEscaneado = async (codigo: string) => {
    setLoading(true);
    try {
      if (tipoEscaner === 'producto') {
        const producto = await stockService.buscarProductoPorCodigo(codigo);
        if (producto) {
          if (productos.some(p => p.codigoBarras === producto.codigoBarras)) {
            Alert.alert('Atención', 'Este producto ya ha sido agregado.');
          } else {
            setProductos([...productos, producto]);
          }
        }
      } else {
        const accesorio = await stockService.buscarAccesorioPorCodigo(codigo);
        if (accesorio) {
          if (accesorios.some(a => a.codigoBarrasAccs === accesorio.codigoBarrasAccs)) {
            Alert.alert('Atención', 'Este accesorio ya ha sido agregado.');
          } else {
            setAccesorios([...accesorios, accesorio]);
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.msg || `No se pudo encontrar el ${tipoEscaner}`);
    } finally {
      setLoading(false);
      setMostrarEscaner(false);
    }
  };

  const handleSubmit = async () => {
    if (!areaLlegada || !observacion) {
      Alert.alert('Campos Incompletos', 'Por favor, seleccione el área de llegada y añada una observación.');
      return;
    }
    if (productos.length === 0 && accesorios.length === 0) {
      Alert.alert('Sin Items', 'Debe agregar al menos un producto o accesorio al movimiento.');
      return;
    }

    setLoading(true);
    try {
      await movimientoService.registrarMovimiento({
        productos: productos.map(p => ({ codigoBarras: p.codigoBarras })),
        accesorios: accesorios.map(a => ({ codigoBarrasAccs: a.codigoBarrasAccs })),
        areaLlegada,
        observacion,
      });
      Alert.alert('Éxito', 'Movimiento registrado correctamente.');
      setProductos([]);
      setAccesorios([]);
      setAreaLlegada('');
      setObservacion('');
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'No se pudo registrar el movimiento.');
    } finally {
      setLoading(false);
    }
  };

  const borrarProducto = (idx: number) => {
    setProductos(productos.filter((_, i) => i !== idx));
  };

  const borrarAccesorio = (idx: number) => {
    setAccesorios(accesorios.filter((_, i) => i !== idx));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* SECCIÓN DISPOSITIVOS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dispositivos</Text>
        {productos.map((producto, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemText}><Text style={styles.itemLabel}>Nombre:</Text> {producto.nombreEquipo}</Text>
              <Text style={styles.itemText}><Text style={styles.itemLabel}>Capacidad:</Text> {producto.capacidad}</Text>
              <Text style={styles.itemText}><Text style={styles.itemLabel}>Código:</Text> {producto.codigoBarras}</Text>
            </View>
            <TouchableOpacity onPress={() => borrarProducto(index)}>
              <MaterialIcons name="delete-outline" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={() => { setTipoEscaner('producto'); setMostrarEscaner(true); }}>
          <Text style={styles.buttonText}>Agregar Dispositivo</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN ACCESORIOS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Accesorios</Text>
        {accesorios.map((accesorio, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemText}><Text style={styles.itemLabel}>Nombre:</Text> {accesorio.nombreAccs}</Text>
              <Text style={styles.itemText}><Text style={styles.itemLabel}>Código:</Text> {accesorio.codigoBarrasAccs}</Text>
            </View>
            <TouchableOpacity onPress={() => borrarAccesorio(index)}>
              <MaterialIcons name="delete-outline" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.button} onPress={() => { setTipoEscaner('accesorio'); setMostrarEscaner(true); }}>
          <Text style={styles.buttonText}>Agregar Accesorio</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DETALLES DEL MOVIMIENTO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles del Movimiento</Text>
        <SimpleSelector
          label="Área de Llegada"
          options={areas}
          value={areaLlegada}
          onChange={setAreaLlegada}
          placeholder="Seleccione el área de llegada"
        />
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Observación</Text>
          <TextInput
            value={observacion}
            onChangeText={setObservacion}
            multiline
            numberOfLines={4}
            style={styles.textInput}
            placeholder="Escriba aquí la observación..."
            placeholderTextColor={Colors.light.placeholder}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.dark.text} /> : <Text style={styles.buttonText}>Guardar Movimiento</Text>}
        </TouchableOpacity>
      </View>

      {/* MODAL DE ESCANER */}
      <Modal visible={mostrarEscaner} transparent={false} animationType="slide">
        <EscanerCodigoBarras
          onCodigoEscaneado={handleCodigoEscaneado}
          onCerrar={() => setMostrarEscaner(false)}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    color: Colors.light.text,
    fontSize: 14,
  },
  itemLabel: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: Colors.light.button,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: Colors.light.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
}); 