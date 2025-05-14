import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { productoService, accesorioService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TipoProductoSelector from './TipoProductoSelector';
import CodigoBarras from './CodigoBarras';
import CategoriaSelector from './CategoriaSelector';
import CapacidadSelector from './CapacidadSelector';
import TipoSelector from './TipoSelector';
import { useFocusEffect } from '@react-navigation/native';

interface ProductFormData {
  codigoUnico: string;
  codigoSerial: string;
  nombreEquipo: string;
  color: string;
  capacidad: string;
  precio: string;
  tipo: string;
  categoria: string;
}

interface AccesorioFormData {
  codigoUnico: string;
  nombre: string;
  precio: string;
}

type CodigoBarrasAccs = { codigoBarrasAccs: string };

type ProductoTipo = 'dispositivos' | 'accesorios';

export default function ProductoForm() {
  const { user } = useAuth();
  const [tipoProducto, setTipoProducto] = useState<ProductoTipo>('dispositivos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [codigoBarrasDispositivo, setCodigoBarrasDispositivo] = useState<string | null>(null);
  const [codigoBarrasAccesorio, setCodigoBarrasAccesorio] = useState<string | null>(null);
  const [listaCodigosDispositivos, setListaCodigosDispositivos] = useState<string[]>([]);
  const [listaCodigosAccesorios, setListaCodigosAccesorios] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultadoBusqueda, setResultadoBusqueda] = useState<any | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    codigoUnico: '',
    codigoSerial: '',
    nombreEquipo: '',
    color: '',
    capacidad: '',
    precio: '',
    tipo: '',
    categoria: '',
  });

  const [accesorioData, setAccesorioData] = useState<AccesorioFormData>({
    codigoUnico: '',
    nombre: '',
    precio: '',
  });

  useEffect(() => {
    setCodigoBarrasDispositivo(null);
    setCodigoBarrasAccesorio(null);
    if (tipoProducto === 'dispositivos') {
      productoService.obtenerProductos().then(response => {
        console.log('Productos obtenidos:', response);
        // Accedemos al array de productos dentro de la respuesta
        const productos = response.productos || [];
        setListaCodigosDispositivos(productos.map((p: { codigoBarras: string }) => p.codigoBarras));
      });
    } else if (tipoProducto === 'accesorios') {
      accesorioService.obtenerAccesorios().then(accesorios => {
        setListaCodigosAccesorios(accesorios.map((a: { codigoBarrasAccs: string }) => a.codigoBarrasAccs));
      });
    }
  }, [tipoProducto]);

  useFocusEffect(
    React.useCallback(() => {
      setMostrarFormulario(false);
      setCodigoBarrasDispositivo(null);
      setCodigoBarrasAccesorio(null);
      setFormData({
        codigoUnico: '',
        codigoSerial: '',
        nombreEquipo: '',
        color: '',
        capacidad: '',
        precio: '',
        tipo: '',
        categoria: '',
      });
      setAccesorioData({
        codigoUnico: '',
        nombre: '',
        precio: '',
      });
    }, [])
  );

  const handleTipoSelect = (tipo: 'dispositivos' | 'accesorios') => {
    setTipoProducto(tipo);
    setMostrarFormulario(false);
  };

  const handleSubmit = async () => {
    if (tipoProducto === 'accesorios') {
      // Validar campos requeridos para accesorios
      const camposRequeridos = Object.entries(accesorioData).filter(([key, value]) => !value);
      if (camposRequeridos.length > 0) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
        return;
      }

      try {
        const accesorioDataToSend = {
          codigoUnicoAccs: accesorioData.codigoUnico,
          nombreAccs: accesorioData.nombre,
          precioAccs: accesorioData.precio,
          disponibilidadAccs: "Disponible"
        };

        if (codigoBarrasAccesorio) {
          // Actualizar
          await accesorioService.actualizarAccesorio(codigoBarrasAccesorio, accesorioDataToSend);
          Alert.alert('Éxito', 'Accesorio actualizado correctamente', [
            {
              text: 'OK',
              onPress: () => {
                setMostrarFormulario(false);
                setCodigoBarrasAccesorio(null);
                setAccesorioData({
                  codigoUnico: '',
                  nombre: '',
                  precio: '',
                });
              }
            }
          ]);
        } else {
          // Crear nuevo
          const response = await accesorioService.crearAccesorio(accesorioDataToSend);
          if (response.accesorio) {
            setCodigoBarrasAccesorio(response.accesorio.codigoBarrasAccs);
            setMostrarFormulario(false);
            setAccesorioData({
              codigoUnico: '',
              nombre: '',
              precio: '',
            });
            // Actualizar la lista de accesorios después de crear uno nuevo
            const accesorios = await accesorioService.obtenerAccesorios();
            setListaCodigosAccesorios(accesorios.map((a: { codigoBarrasAccs: string }) => a.codigoBarrasAccs));
          }
        }
      } catch (error: any) {
        console.error('Error completo:', error);
        Alert.alert('Error', error.msg || 'No se pudo registrar el accesorio');
      }
      return;
    }

    // Validar campos requeridos para dispositivos
    const camposRequeridos = Object.entries(formData).filter(([key, value]) => !value);
    if (camposRequeridos.length > 0) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      const productoData = {
        ...formData,
        precio: parseFloat(formData.precio),
      };

      if (codigoBarrasDispositivo) {
        // Actualizar
        await productoService.actualizarProducto(codigoBarrasDispositivo, productoData);
        Alert.alert('Éxito', 'Producto actualizado correctamente', [
          {
            text: 'OK',
            onPress: () => {
              setMostrarFormulario(false);
              setCodigoBarrasDispositivo(null);
              setFormData({
                codigoUnico: '',
                codigoSerial: '',
                nombreEquipo: '',
                color: '',
                capacidad: '',
                precio: '',
                tipo: '',
                categoria: '',
              });
            }
          }
        ]);
      } else {
        // Crear nuevo
        const response = await productoService.crearProducto(productoData);
        if (response.producto) {
          setCodigoBarrasDispositivo(response.producto.codigoBarras);
          setMostrarFormulario(false);
          setFormData({
            codigoUnico: '',
            codigoSerial: '',
            nombreEquipo: '',
            color: '',
            capacidad: '',
            precio: '',
            tipo: '',
            categoria: '',
          });
          // Cambia el nombre aquí
          const productosResponse = await productoService.obtenerProductos();
          const productos = productosResponse.productos || [];
          setListaCodigosDispositivos(productos.map((p: { codigoBarras: string }) => p.codigoBarras));
        }
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      Alert.alert('Error', error.msg || 'No se pudo registrar el producto');
    }
  };

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      setResultadoBusqueda(null);
      return;
    }
    setBuscando(true);
    try {
      if (tipoProducto === 'dispositivos') {
        const res = await productoService.obtenerProductoPorCodigo(busqueda.trim());
        if (res.producto) {
          setResultadoBusqueda(res.producto);
        } else {
          setResultadoBusqueda('no-encontrado');
        }
      } else {
        const res = await accesorioService.obtenerAccesorioPorCodigo(busqueda.trim());
        if (res.accesorio) {
          setResultadoBusqueda(res.accesorio);
        } else {
          setResultadoBusqueda('no-encontrado');
        }
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setResultadoBusqueda('no-encontrado');
    }
    setBuscando(false);
  };

  const handleEditar = async (codigoBarras: string) => {
    try {
      console.log('Buscando accesorio con código:', codigoBarras);
      if (tipoProducto === 'dispositivos') {
        const res = await productoService.obtenerProductoPorCodigo(codigoBarras);
        console.log('Datos del producto recibidos:', res.producto);
        if (res.producto) {
          setFormData({
            codigoUnico: res.producto.codigoUnico || '',
            codigoSerial: res.producto.codigoSerial || '',
            nombreEquipo: res.producto.nombreEquipo || '',
            color: res.producto.color || '',
            capacidad: res.producto.capacidad || '',
            precio: res.producto.precio ? res.producto.precio.toString() : '',
            tipo: res.producto.tipo || '',
            categoria: res.producto.categoria || res.producto.categoriaNombre || '',
          });
          setCodigoBarrasDispositivo(codigoBarras);
          setMostrarFormulario(true);
        }
      } else {
        const res = await accesorioService.obtenerAccesorioPorCodigo(codigoBarras);
        if (res.accesorio) {
          setAccesorioData({
            codigoUnico: res.accesorio.codigoUnicoAccs || '',
            nombre: res.accesorio.nombreAccs || '',
            precio: res.accesorio.precioAccs ? res.accesorio.precioAccs.toString() : '',
          });
          setCodigoBarrasAccesorio(codigoBarras);
          setMostrarFormulario(true);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos para editar:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos para editar');
    }
  };

  const handleVer = async (codigoBarras: string) => {
    try {
      console.log('Buscando accesorio con código:', codigoBarras);
      if (tipoProducto === 'dispositivos') {
        const res = await productoService.obtenerProductoPorCodigo(codigoBarras);
        if (res.producto) {
          // Extraer categoría (puede ser array)
          let categoria = '';
          if (Array.isArray(res.producto.categoriaNombre) && res.producto.categoriaNombre.length > 0) {
            categoria = res.producto.categoriaNombre[0].nombreCategoria || '';
          } else if (typeof res.producto.categoriaNombre === 'string') {
            categoria = res.producto.categoriaNombre;
          } else if (res.producto.categoria && typeof res.producto.categoria === 'string') {
            categoria = res.producto.categoria;
          }

          // Extraer responsable (puede ser array)
          let responsable = '';
          if (Array.isArray(res.producto.responsable) && res.producto.responsable.length > 0) {
            responsable = res.producto.responsable[0].nombre || '';
          } else if (typeof res.producto.responsable === 'string') {
            responsable = res.producto.responsable;
          }

          Alert.alert(
            'Detalle del producto',
            `Código de Barras: ${res.producto.codigoBarras}\n` +
            `Código Único: ${res.producto.codigoUnico}\n` +
            `Código Serial: ${res.producto.codigoSerial}\n` +
            `Nombre: ${res.producto.nombreEquipo}\n` +
            `Color: ${res.producto.color}\n` +
            `Capacidad: ${res.producto.capacidad}\n` +
            `Precio: ${res.producto.precio}\n` +
            `Tipo: ${res.producto.tipo}\n` +
            `Categoría: ${categoria}\n` +
            `Responsable: ${responsable}\n` +
            `Locación: ${res.producto.locacion || ''}\n` +
            `Fecha Ingreso: ${res.producto.fechaIngreso ? new Date(res.producto.fechaIngreso).toLocaleString() : ''}`
          );
        }
      } else {
        const res = await accesorioService.obtenerAccesorioPorCodigo(codigoBarras);
        if (res.accesorio) {
          // Extraer responsable (puede ser array)
          let responsable = '';
          if (Array.isArray(res.accesorio.responsableAccs) && res.accesorio.responsableAccs.length > 0) {
            responsable = res.accesorio.responsableAccs[0].nombre || '';
          } else if (typeof res.accesorio.responsableAccs === 'string') {
            responsable = res.accesorio.responsableAccs;
          }

          Alert.alert(
            'Detalle del accesorio',
            `Código de Barras: ${res.accesorio.codigoBarrasAccs}\n` +
            `Código Único: ${res.accesorio.codigoUnicoAccs}\n` +
            `Nombre: ${res.accesorio.nombreAccs}\n` +
            `Precio: ${res.accesorio.precioAccs}\n` +
            `Disponibilidad: ${res.accesorio.disponibilidadAccs}\n` +
            `Locación: ${res.accesorio.locacionAccs}\n` +
            `Responsable: ${responsable}\n`
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos para visualizar');
    }
  };

  const renderFormularioDispositivos = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Código Único *</Text>
        <TextInput
          style={styles.input}
          value={formData.codigoUnico}
          onChangeText={(text) => setFormData({ ...formData, codigoUnico: text })}
          placeholder="Ingrese el código único"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Código Serial *</Text>
        <TextInput
          style={styles.input}
          value={formData.codigoSerial}
          onChangeText={(text) => setFormData({ ...formData, codigoSerial: text })}
          placeholder="Ingrese el código serial"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre del Equipo *</Text>
        <TextInput
          style={styles.input}
          value={formData.nombreEquipo}
          onChangeText={(text) => setFormData({ ...formData, nombreEquipo: text })}
          placeholder="Ingrese el nombre del equipo"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Color *</Text>
        <TextInput
          style={styles.input}
          value={formData.color}
          onChangeText={(text) => setFormData({ ...formData, color: text })}
          placeholder="Ingrese el color"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría *</Text>
        <CategoriaSelector
          value={formData.categoria ? formData.categoria.toString() : ''}
          onChange={(value) => {
            if (value) {
              setFormData({ ...formData, categoria: value, capacidad: '' });
            }
          }}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Capacidad *</Text>
        <CapacidadSelector
          value={formData.capacidad}
          onChange={(value) => setFormData({ ...formData, capacidad: value })}
          categoria={formData.categoria}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Precio *</Text>
        <TextInput
          style={styles.input}
          value={formData.precio}
          onChangeText={(text) => setFormData({ ...formData, precio: text })}
          placeholder="Ingrese el precio"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo *</Text>
        <TipoSelector
          value={formData.tipo}
          onChange={(value) => setFormData({ ...formData, tipo: value })}
        />
      </View>
    </>
  );

  const renderFormularioAccesorios = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Código Único *</Text>
        <TextInput
          style={styles.input}
          value={accesorioData.codigoUnico}
          onChangeText={(text) => setAccesorioData({ ...accesorioData, codigoUnico: text })}
          placeholder="Ingrese el código único"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={accesorioData.nombre}
          onChangeText={(text) => setAccesorioData({ ...accesorioData, nombre: text })}
          placeholder="Ingrese el nombre del accesorio"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Precio *</Text>
        <TextInput
          style={styles.input}
          value={accesorioData.precio}
          onChangeText={(text) => setAccesorioData({ ...accesorioData, precio: text })}
          placeholder="Ingrese el precio"
          keyboardType="numeric"
        />
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TipoProductoSelector
          tipoSeleccionado={tipoProducto}
          onSelect={(tipo) => {
            setTipoProducto(tipo);
            setMostrarFormulario(false);
          }}
        />

        {!mostrarFormulario && (
          <>
            {/* Título general solo si hay códigos y no se está mostrando el formulario */}
            {((tipoProducto === 'dispositivos' && listaCodigosDispositivos.length > 0) || (tipoProducto === 'accesorios' && listaCodigosAccesorios.length > 0)) ? (
              <Text style={[styles.codigosListaTitle, { fontSize: 20, marginBottom: 10 }]}>Códigos de Barras Generados</Text>
            ) : null}

            {tipoProducto === 'dispositivos' && listaCodigosDispositivos.length > 0 && (
              <View>
                {listaCodigosDispositivos.map((p: string) => (
                  <View key={p} style={styles.codigosListaContainer}>
                    <View style={styles.codigoBarrasRow}>
                      <View style={styles.codigoBarrasContainer}>
                        <CodigoBarras codigo={p} />
                      </View>
                      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEditar(p)}>
                          <MaterialIcons name="edit" size={24} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleVer(p)}>
                          <MaterialIcons name="visibility" size={24} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {tipoProducto === 'accesorios' && listaCodigosAccesorios.length > 0 && (
              <View>
                {listaCodigosAccesorios.map((a: string) => (
                  <View key={a} style={styles.codigosListaContainer}>
                    <View style={styles.codigoBarrasRow}>
                      <View style={styles.codigoBarrasContainer}>
                        <CodigoBarras codigo={a} />
                      </View>
                      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEditar(a)}>
                          <MaterialIcons name="edit" size={24} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleVer(a)}>
                          <MaterialIcons name="visibility" size={24} color="#007AFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={() => {
              setMostrarFormulario(true);
              setFormData({
                codigoUnico: '',
                codigoSerial: '',
                nombreEquipo: '',
                color: '',
                capacidad: '',
                precio: '',
                tipo: '',
                categoria: '',
              });
              setCodigoBarrasDispositivo(null);
              setCodigoBarrasAccesorio(null);
              setAccesorioData({
                codigoUnico: '',
                nombre: '',
                precio: '',
              });
            }}>
              <Text style={styles.submitButtonText}>Agregar</Text>
            </TouchableOpacity>
          </>
        )}

        {mostrarFormulario && (
          <>
            {tipoProducto === 'dispositivos' ? renderFormularioDispositivos() : renderFormularioAccesorios()}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {codigoBarrasDispositivo || codigoBarrasAccesorio ? 'Actualizar' : 'Registrar Producto'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: '#aaa', marginTop: 10 }]}
              onPress={() => {
                setMostrarFormulario(false);
                setCodigoBarrasDispositivo(null);
                setCodigoBarrasAccesorio(null);
                setFormData({
                  codigoUnico: '',
                  codigoSerial: '',
                  nombreEquipo: '',
                  color: '',
                  capacidad: '',
                  precio: '',
                  tipo: '',
                  categoria: '',
                });
                setAccesorioData({
                  codigoUnico: '',
                  nombre: '',
                  precio: '',
                });
              }}
            >
              <Text style={styles.submitButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  codigosListaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  codigosListaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  codigoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  codigoNumero: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
    color: '#666',
  },
  codigoBarrasWrapper: {
    flex: 1,
  },
  codigoBarrasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codigoBarrasContainer: {
    flex: 1,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 