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
import { productoService, accesorioService, stockService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TipoProductoSelector from './TipoProductoSelector';
import CodigoBarras from './CodigoBarras';
import CategoriaSelector from './CategoriaSelector';
import CapacidadSelector from './CapacidadSelector';
import TipoSelector from './TipoSelector';
import { useFocusEffect } from '@react-navigation/native';
import { categoriaService } from '../services/api';
import { Colors } from '@/constants/Colors';
import DetalleModal from './DetalleModal';

interface ProductFormData {
  codigoModelo: string;
  codigoSerial: string;
  nombreEquipo: string;
  color: string;
  capacidad: string;
  precio: string;
  tipo: string;
  categoria: string;
}

interface AccesorioFormData {
  codigoModeloAccs: string;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDetails, setModalDetails] = useState<Record<string, string | number | null | undefined>>({});

  const [formData, setFormData] = useState<ProductFormData>({
    codigoModelo: '',
    codigoSerial: '',
    nombreEquipo: '',
    color: '',
    capacidad: '',
    precio: '',
    tipo: '',
    categoria: '',
  });

  const [accesorioData, setAccesorioData] = useState<AccesorioFormData>({
    codigoModeloAccs: '',
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
        codigoModelo: '',
        codigoSerial: '',
        nombreEquipo: '',
        color: '',
        capacidad: '',
        precio: '',
        tipo: '',
        categoria: '',
      });
      setAccesorioData({
        codigoModeloAccs: '',
        nombre: '',
        precio: '',
      });
    }, [])
  );

  const handleTipoSelect = (tipo: 'dispositivos' | 'accesorios') => {
    setTipoProducto(tipo);
    setMostrarFormulario(false);
  };

  const actualizarStock = async () => {
    try {
      // Forzar una actualización del stock
      await stockService.obtenerStockDisponible({});
    } catch (error) {
      console.error('Error al actualizar el stock:', error);
    }
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
          codigoModeloAccs: accesorioData.codigoModeloAccs,
          nombreAccs: accesorioData.nombre,
          precioAccs: accesorioData.precio,
          disponibilidadAccs: "Disponible",
          categoriaNombre: "accesorio"
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
                  codigoModeloAccs: '',
                  nombre: '',
                  precio: '',
                });
                actualizarStock(); // Actualizar stock después de actualizar
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
              codigoModeloAccs: '',
            nombre: '',
            precio: '',
          });
            // Actualizar la lista de accesorios después de crear uno nuevo
            const accesorios = await accesorioService.obtenerAccesorios();
            setListaCodigosAccesorios(accesorios.map((a: { codigoBarrasAccs: string }) => a.codigoBarrasAccs));
            actualizarStock(); // Actualizar stock después de crear
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
                codigoModelo: '',
                codigoSerial: '',
                nombreEquipo: '',
                color: '',
                capacidad: '',
                precio: '',
                tipo: '',
                categoria: '',
              });
              actualizarStock(); // Actualizar stock después de actualizar
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
            codigoModelo: '',
          codigoSerial: '',
          nombreEquipo: '',
          color: '',
          capacidad: '',
          precio: '',
          tipo: '',
          categoria: '',
        });
          // Actualizar la lista de productos después de crear uno nuevo
          const productosResponse = await productoService.obtenerProductos();
          const productos = productosResponse.productos || [];
          setListaCodigosDispositivos(productos.map((p: { codigoBarras: string }) => p.codigoBarras));
          actualizarStock(); // Actualizar stock después de crear
        }
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      Alert.alert('Error', error.msg || 'El código de serial ya existe. Por favor, verifica e intenta con otro.');
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
            codigoModelo: res.producto.codigoModelo || '',
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
            codigoModeloAccs: res.accesorio.codigoModeloAccs || '',
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
      console.log('Buscando con código:', codigoBarras);
      if (tipoProducto === 'dispositivos') {
        const res = await productoService.obtenerProductoPorCodigo(codigoBarras);
        if (res.producto) {
          let categoria = '';
          if (Array.isArray(res.producto.categoriaNombre) && res.producto.categoriaNombre.length > 0) {
            categoria = res.producto.categoriaNombre[0].nombreCategoria || '';
          } else if (typeof res.producto.categoriaNombre === 'string') {
            categoria = res.producto.categoriaNombre;
          } else if (res.producto.categoria && typeof res.producto.categoria === 'string') {
            categoria = res.producto.categoria;
          }
          let responsable = '';
          if (Array.isArray(res.producto.responsable) && res.producto.responsable.length > 0) {
            responsable = res.producto.responsable[0].nombre || '';
          } else if (typeof res.producto.responsable === 'string') {
            responsable = res.producto.responsable;
          }

          setModalTitle('Detalle del Dispositivo');
          setModalDetails({
            'Código de Barras': res.producto.codigoBarras,
            'Código de Modelo': res.producto.codigoModelo,
            'Código Serial': res.producto.codigoSerial,
            'Nombre': res.producto.nombreEquipo,
            'Color': res.producto.color,
            'Capacidad': res.producto.capacidad,
            'Precio': res.producto.precio,
            'Tipo': res.producto.tipo,
            'Estado': res.producto.estado || '',
            'Categoría': categoria,
            'Responsable': responsable,
            'Locación': res.producto.locacion || '',
            'Fecha Ingreso': res.producto.fechaIngreso ? new Date(res.producto.fechaIngreso).toLocaleString() : ''
          });
          setModalVisible(true);
        }
      } else {
        const res = await accesorioService.obtenerAccesorioPorCodigo(codigoBarras);
        if (res.accesorio) {
          let responsable = '';
          if (Array.isArray(res.accesorio.responsableAccs) && res.accesorio.responsableAccs.length > 0) {
            responsable = res.accesorio.responsableAccs[0].nombre || '';
          } else if (typeof res.accesorio.responsableAccs === 'string') {
            responsable = res.accesorio.responsableAccs;
          }

          setModalTitle('Detalle del Accesorio');
          setModalDetails({
            'Código de Barras': res.accesorio.codigoBarrasAccs,
            'Código de Modelo': res.accesorio.codigoModeloAccs,
            'Nombre': res.accesorio.nombreAccs,
            'Precio': res.accesorio.precioAccs,
            'Disponibilidad': res.accesorio.disponibilidadAccs,
            'Categoría': res.accesorio.categoriaNombre && Array.isArray(res.accesorio.categoriaNombre) && res.accesorio.categoriaNombre.length > 0 ? res.accesorio.categoriaNombre[0].nombreCategoria : (res.accesorio.categoriaNombre?.nombreCategoria || ''),
            'Locación': res.accesorio.locacionAccs,
            'Responsable': responsable,
            'Fecha Ingreso': res.accesorio.fechaIngreso ? new Date(res.accesorio.fechaIngreso).toLocaleString() : ''
          });
          setModalVisible(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos para visualizar');
    }
  };

  const renderFormularioDispositivos = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Código de Modelo *</Text>
        <TextInput
          style={styles.input}
          value={formData.codigoModelo}
          onChangeText={(text) => setFormData({ ...formData, codigoModelo: text })}
          placeholder="Ingrese el código de modelo"
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
        <Text style={styles.label}>Código de Modelo *</Text>
        <TextInput
          style={styles.input}
          value={accesorioData.codigoModeloAccs}
          onChangeText={(text) => setAccesorioData({ ...accesorioData, codigoModeloAccs: text })}
          placeholder="Ingrese el código de modelo"
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría</Text>
        <Text style={{ padding: 12, backgroundColor: '#eee', borderRadius: 8 }}>Accesorio</Text>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <DetalleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        details={modalDetails}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
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
                            <MaterialIcons name="edit" size={24} color={Colors.light.icon} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.editButton} onPress={() => handleVer(p)}>
                            <MaterialIcons name="visibility" size={24} color={Colors.light.icon} />
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
                            <MaterialIcons name="edit" size={24} color={Colors.light.icon} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.editButton} onPress={() => handleVer(a)}>
                            <MaterialIcons name="visibility" size={24} color={Colors.light.icon} />
                          </TouchableOpacity>
                        </View>
                      </View>
          </View>
        ))}
          </View>
              )}
            </>
          )}

          {mostrarFormulario && (
          <>
            {tipoProducto === 'dispositivos' ? renderFormularioDispositivos() : renderFormularioAccesorios()}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {codigoBarrasDispositivo || codigoBarrasAccesorio ? 'Actualizar' : 'Registrar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setMostrarFormulario(false);
                  setCodigoBarrasDispositivo(null);
                  setCodigoBarrasAccesorio(null);
                  setFormData({
                    codigoModelo: '',
                    codigoSerial: '',
                    nombreEquipo: '',
                    color: '',
                    capacidad: '',
                    precio: '',
                    tipo: '',
                    categoria: '',
                  });
                  setAccesorioData({
                    codigoModeloAccs: '',
                    nombre: '',
                    precio: '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
      {/* Botón Agregar fijo abajo */}
      {!mostrarFormulario && (
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity style={styles.fixedAddButton} onPress={() => {
            setMostrarFormulario(true);
            setFormData({
              codigoModelo: '',
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
              codigoModeloAccs: '',
              nombre: '',
              precio: '',
            });
          }}>
            <Text style={styles.fixedAddButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.background,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
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
    color: Colors.light.text,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.button,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: Colors.light.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  codigosListaContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  codigosListaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
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
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.background,
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  fixedAddButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  fixedAddButtonText: {
    color: Colors.light.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 