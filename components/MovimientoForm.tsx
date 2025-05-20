import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import EscanerCodigoBarras from './EscanerCodigoBarras';
import api from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import SimpleSelector from './SimpleSelector';

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
      const response = await api.get('/gt/areasunicas');
      const formattedAreas = response.data.map((area: string | { nombreArea: string, _id: string }) => {
        if (typeof area === 'string') {
          return { label: area, value: area };
        } else {
          return { label: area.nombreArea, value: area._id };
        }
      });
      setAreas(formattedAreas);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      Alert.alert('Error', 'No se pudieron cargar las áreas de llegada');
    }
  };

  useEffect(() => {
    cargarAreas();
  }, []);

  const buscarProducto = async (codigo: string) => {
    try {
      const response = await api.get(`/gt/listarProducto/${codigo}`);
      return response.data.producto;
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'No se pudo encontrar el producto');
      return null;
    }
  };

  const buscarAccesorio = async (codigo: string) => {
    try {
      const response = await api.get(`/gt/listarAccesorio/${codigo}`);
      return response.data.accesorio;
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'No se pudo encontrar el accesorio');
      return null;
    }
  };

  const handleCodigoEscaneado = async (codigo: string) => {
    console.log('Código escaneado:', codigo);
    if (tipoEscaner === 'producto') {
      const producto = await buscarProducto(codigo);
      if (producto) {
        if (productos.some(p => p.codigoBarras === producto.codigoBarras)) {
          Alert.alert('Error', 'Este producto ya ha sido agregado');
          return;
        }
        setProductos([...productos, producto]);
      }
    } else {
      const accesorio = await buscarAccesorio(codigo);
      if (accesorio) {
        if (accesorios.some(a => a.codigoBarrasAccs === accesorio.codigoBarrasAccs)) {
          Alert.alert('Error', 'Este accesorio ya ha sido agregado');
          return;
        }
        setAccesorios([...accesorios, accesorio]);
      }
    }
    setMostrarEscaner(false);
  };

  const handleSubmit = async () => {
    if (!areaLlegada || !observacion) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (productos.length === 0 && accesorios.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto o accesorio');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/gt/registrarMovimiento', {
        productos: productos.map(p => ({ codigoBarras: p.codigoBarras })),
        accesorios: accesorios.map(a => ({ codigoBarrasAccs: a.codigoBarrasAccs })),
        areaLlegada,
        observacion
      });

      Alert.alert('Éxito', 'Movimiento registrado correctamente');
      setProductos([]);
      setAccesorios([]);
      setAreaLlegada('');
      setObservacion('');
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'Error al registrar el movimiento');
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

  if (mostrarEscaner) {
    return (
      <EscanerCodigoBarras
        onCodigoEscaneado={handleCodigoEscaneado}
        onCerrar={() => setMostrarEscaner(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Title title="Dispositivos" />
        <Card.Content>
          {productos.map((producto, index) => (
            <View key={index} style={[styles.item, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text>Código: {producto.codigoBarras}</Text>
                <Text>Nombre: {producto.nombreEquipo}</Text>
                <Text>Capacidad: {producto.capacidad}</Text>
                <Text>Color: {producto.color}</Text>
                <Text>Serial: {producto.codigoSerial}</Text>
              </View>
              <TouchableOpacity onPress={() => borrarProducto(index)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <Button
            mode="contained"
            onPress={() => {
              setTipoEscaner('producto');
              setMostrarEscaner(true);
            }}
            style={styles.button}
          >
            Agregar Dispositivo
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Accesorios" />
        <Card.Content>
          {accesorios.map((accesorio, index) => (
            <View key={index} style={[styles.item, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text>Código: {accesorio.codigoBarrasAccs}</Text>
                <Text>Nombre: {accesorio.nombreAccs}</Text>
              </View>
              <TouchableOpacity onPress={() => borrarAccesorio(index)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <Button
            mode="contained"
            onPress={() => {
              setTipoEscaner('accesorio');
              setMostrarEscaner(true);
            }}
            style={styles.button}
          >
            Agregar Accesorio
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Detalles del Movimiento" />
        <Card.Content>
          <SimpleSelector
            label="Área de Llegada"
            options={areas}
            value={areaLlegada}
            onChange={setAreaLlegada}
            placeholder="Seleccione el área de llegada"
          />
          <TextInput
            label="Observación"
            value={observacion}
            onChangeText={setObservacion}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Guardar Movimiento
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  item: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
}); 