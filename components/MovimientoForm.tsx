import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarEscaner, setMostrarEscaner] = useState(false);
  const [tipoEscaner, setTipoEscaner] = useState<'producto' | 'accesorio'>('producto');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [accesorios, setAccesorios] = useState<Accesorio[]>([]);
  const [areaLlegada, setAreaLlegada] = useState('');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<{ label: string; value: string }[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<any>(null);

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

  const cargarMovimientos = async () => {
    setCargandoMovimientos(true);
    try {
      const response = await api.get('/gt/movimientosBodeguero');
      console.log('Movimientos recibidos:', response.data);
      setMovimientos(response.data || []);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
      Alert.alert('Error', 'No se pudieron cargar los movimientos');
    } finally {
      setCargandoMovimientos(false);
    }
  };

  useEffect(() => {
    cargarAreas();
    cargarMovimientos();
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
      await api.post('/gt/registrarMovimiento', {
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
      setMostrarFormulario(false);
      cargarMovimientos();
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

  if (!mostrarFormulario) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Movimientos Registrados</Text>
          {cargandoMovimientos && <ActivityIndicator size="large" color="#007AFF" />}
          {!cargandoMovimientos && movimientos.length === 0 && (
            <Text style={{ color: '#888', marginBottom: 20 }}>No hay movimientos registrados aún.</Text>
          )}
          {!cargandoMovimientos && movimientos.map((mov, idx) => (
            <Card key={mov._id || idx} style={{ marginBottom: 10 }}>
              <Card.Title title={`Movimiento #${idx + 1}`} />
              <Card.Content>
                <Text>Área de llegada: {mov.areaLlegada?.nombreArea || mov.areaLlegada}</Text>
                <Text>Observación: {mov.observacion}</Text>
                <Text>Fecha: {mov.fecha ? new Date(mov.fecha).toLocaleString() : ''}</Text>
                <Text>Dispositivos: {mov.productos?.length || 0}</Text>
                <Text>Accesorios: {mov.accesorios?.length || 0}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => {
                  setMovimientoSeleccionado(mov);
                  setModalDetalleVisible(true);
                }}>Ver Detalle</Button>
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 32,
            margin: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setMostrarFormulario(true)}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Agregar Movimiento</Text>
        </TouchableOpacity>
        <Modal
          visible={modalDetalleVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalDetalleVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              width: '90%',
              maxHeight: '80%',
            }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Detalle del Movimiento</Text>
              {movimientoSeleccionado && (
                <ScrollView>
                  <Text>Área de llegada: {movimientoSeleccionado.areaLlegada?.nombreArea || movimientoSeleccionado.areaLlegada}</Text>
                  <Text>Área de salida: {movimientoSeleccionado.areaSalida}</Text>
                  <Text>Observación: {movimientoSeleccionado.observacion}</Text>
                  <Text>Fecha: {movimientoSeleccionado.fecha ? new Date(movimientoSeleccionado.fecha).toLocaleString() : ''}</Text>
                  <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Dispositivos:</Text>
                  {movimientoSeleccionado.productos && movimientoSeleccionado.productos.length > 0 ? (
                    movimientoSeleccionado.productos.map((p: any, idx: number) => (
                      <View key={idx} style={{ marginLeft: 10, marginBottom: 4 }}>
                        <Text>- {p.nombreEquipo} (SN: {p.codigoSerial})</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ marginLeft: 10, marginBottom: 4 }}>Ninguno</Text>
                  )}
                  <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Accesorios:</Text>
                  {movimientoSeleccionado.accesorios && movimientoSeleccionado.accesorios.length > 0 ? (
                    movimientoSeleccionado.accesorios.map((a: any, idx: number) => (
                      <View key={idx} style={{ marginLeft: 10, marginBottom: 4 }}>
                        <Text>- {a.nombreAccs}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ marginLeft: 10, marginBottom: 4 }}>Ninguno</Text>
                  )}
                  <Text style={{ marginTop: 8 }}>Responsable: {Array.isArray(movimientoSeleccionado.responsable) ? movimientoSeleccionado.responsable[0]?.nombreResponsable : movimientoSeleccionado.responsable?.nombreResponsable}</Text>
                </ScrollView>
              )}
              <Button onPress={() => setModalDetalleVisible(false)} style={{ marginTop: 16 }}>Cerrar</Button>
            </View>
          </View>
        </Modal>
      </View>
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
          <Button
            mode="outlined"
            onPress={() => setMostrarFormulario(false)}
            style={{ marginTop: 10 }}
          >
            Cancelar
          </Button>
        </Card.Content>
      </Card>

      {mostrarEscaner && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#000',
          zIndex: 999,
        }}>
          <EscanerCodigoBarras
            onCodigoEscaneado={handleCodigoEscaneado}
            onCerrar={() => setMostrarEscaner(false)}
          />
        </View>
      )}
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