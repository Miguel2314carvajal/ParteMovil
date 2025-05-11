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

        console.log('Enviando datos de accesorio:', accesorioDataToSend);
        const response = await accesorioService.crearAccesorio(accesorioDataToSend);
        console.log('Respuesta del servidor:', response);
        
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
        } else {
          throw new Error('No se recibió la información del accesorio creado');
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
    } catch (error: any) {
      console.error('Error completo:', error);
      Alert.alert('Error', error.msg || 'No se pudo registrar el producto');
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
          value={formData.categoria}
          onChange={(value) => {
            // Limpiar la capacidad al cambiar la categoría
            setFormData({ ...formData, categoria: value, capacidad: '' });
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

        {/* Título general solo si hay códigos y no se está mostrando el formulario */}
        {(!mostrarFormulario && ((tipoProducto === 'dispositivos' && listaCodigosDispositivos.length > 0) || (tipoProducto === 'accesorios' && listaCodigosAccesorios.length > 0))) ? (
          <Text style={[styles.codigosListaTitle, { fontSize: 20, marginBottom: 10 }]}>Códigos de Barras Generados</Text>
        ) : null}

        {/* Lista de códigos de barras solo si no se está mostrando el formulario */}
        {!mostrarFormulario && tipoProducto === 'dispositivos' && listaCodigosDispositivos.length > 0 && (
          <View>
            {listaCodigosDispositivos.map((p: string) => (
              <View key={p} style={styles.codigosListaContainer}>
                <CodigoBarras codigo={p} />
              </View>
            ))}
          </View>
        )}
        {!mostrarFormulario && tipoProducto === 'accesorios' && listaCodigosAccesorios.length > 0 && (
          <View>
            {listaCodigosAccesorios.map((a: string) => (
              <View key={a} style={styles.codigosListaContainer}>
                <CodigoBarras codigo={a} />
              </View>
            ))}
          </View>
        )}

        {!mostrarFormulario && (
          <TouchableOpacity style={styles.submitButton} onPress={() => setMostrarFormulario(true)}>
            <Text style={styles.submitButtonText}>Agregar</Text>
          </TouchableOpacity>
        )}

        {mostrarFormulario && (
          <>
            {tipoProducto === 'dispositivos' ? renderFormularioDispositivos() : renderFormularioAccesorios()}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Registrar Producto</Text>
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
}); 