import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { productoService, accesorioService, movimientoService } from '../../services/api';

export default function BuscarScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'producto' | 'accesorio' | 'movimiento'>('producto');
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    setBusqueda('');
    setResultado(null);
  }, [tipoBusqueda]);

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      Alert.alert('Error', 'Por favor ingrese un código de barras o ID');
      return;
    }

    try {
      let data;
      switch (tipoBusqueda) {
        case 'producto':
          data = await productoService.buscarPorCodigoBarras(busqueda);
          data = data?.producto || null;
          break;
        case 'accesorio':
          data = await accesorioService.buscarPorCodigoBarras(busqueda);
          data = data?.accesorio || null;
          break;
        case 'movimiento':
          data = await movimientoService.buscarPorId(busqueda);
          break;
      }
      console.log('RESULTADO DE BUSQUEDA:', data);
      setResultado(data);
    } catch (error: any) {
      Alert.alert('Error', error.msg || 'No se encontró ningún resultado');
      setResultado(null);
    }
  };

  const renderResultado = () => {
    if (!resultado) return null;

    switch (tipoBusqueda) {
      case 'producto':
        if (!resultado || Object.keys(resultado).length === 0) {
          return (
            <View style={styles.resultadoContainer}>
              <Text style={{ color: '#888', textAlign: 'center' }}>No se encontró el dispositivo.</Text>
            </View>
          );
        }
        return (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoTitulo}>Detalle del dispositivo</Text>
            <Text>Código de Barras: {resultado.codigoBarras || 'N/A'}</Text>
            <Text>Código de Modelo: {resultado.codigoModelo || 'N/A'}</Text>
            <Text>Código Serial: {resultado.codigoSerial || 'N/A'}</Text>
            <Text>Nombre: {resultado.nombreEquipo || 'N/A'}</Text>
            <Text>Color: {resultado.color || 'N/A'}</Text>
            <Text>Capacidad: {resultado.capacidad || 'N/A'}</Text>
            <Text>Precio: {resultado.precio || 'N/A'}</Text>
            <Text>Tipo: {resultado.tipo || 'N/A'}</Text>
            <Text>Estado: {resultado.estado || 'N/A'}</Text>
            <Text>Categoría: {resultado.categoriaNombre ? (typeof resultado.categoriaNombre === 'string' ? resultado.categoriaNombre : resultado.categoriaNombre[0]?.nombreCategoria) : 'N/A'}</Text>
            <Text>
              Responsable: {
                resultado.responsable
                  ? Array.isArray(resultado.responsable)
                    ? (resultado.responsable[0]?.nombreResponsable || resultado.responsable[0]?.nombre || 'N/A')
                    : (resultado.responsable.nombreResponsable || resultado.responsable.nombre || resultado.responsable)
                  : 'N/A'
              }
            </Text>
            <Text>
              Locación: {resultado.locacion || resultado.ubicacion || 'N/A'}
            </Text>
            <Text>Fecha Ingreso: {resultado.fechaIngreso ? new Date(resultado.fechaIngreso).toLocaleString() : 'N/A'}</Text>
          </View>
        );
      case 'accesorio':
        return (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoTitulo}>Detalle del accesorio</Text>
            <Text>Código de Barras: {resultado.codigoBarrasAccs || 'N/A'}</Text>
            <Text>Código de Modelo: {resultado.codigoModeloAccs || 'N/A'}</Text>
            <Text>Nombre: {resultado.nombreAccs || 'N/A'}</Text>
            <Text>Precio: {resultado.precioAccs || 'N/A'}</Text>
            <Text>Disponibilidad: {resultado.disponibilidadAccs || 'N/A'}</Text>
            <Text>Categoría: {resultado.categoriaNombre ? (typeof resultado.categoriaNombre === 'string' ? resultado.categoriaNombre : resultado.categoriaNombre[0]?.nombreCategoria) : 'N/A'}</Text>
            <Text>
              Locación: {resultado.locacionAccs || resultado.ubicacion || 'N/A'}
            </Text>
            <Text>
              Responsable: {
                resultado.responsableAccs
                  ? Array.isArray(resultado.responsableAccs)
                    ? (resultado.responsableAccs[0]?.nombre || resultado.responsableAccs[0]?.nombreResponsable || 'N/A')
                    : (resultado.responsableAccs.nombre || resultado.responsableAccs.nombreResponsable || resultado.responsableAccs)
                  : 'N/A'
              }
            </Text>
            <Text>Fecha Ingreso: {resultado.fechaIngreso ? new Date(resultado.fechaIngreso).toLocaleString() : 'N/A'}</Text>
          </View>
        );
      case 'movimiento':
        return (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoTitulo}>Detalle del Movimiento</Text>
            <Text>Fecha: {resultado.fecha ? new Date(resultado.fecha).toLocaleString() : 'N/A'}</Text>
            <Text>Responsable: {resultado.responsable ? (Array.isArray(resultado.responsable) ? resultado.responsable[0]?.nombreResponsable : resultado.responsable) : 'N/A'}</Text>
            <Text>Área de Salida: {resultado.areaSalida || 'N/A'}</Text>
            <Text>Área Llegada: {resultado.areaLlegada || 'N/A'}</Text>
            <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Productos:</Text>
            {resultado.productos && resultado.productos.length > 0 ? (
              resultado.productos.map((p: any, idx: number) => (
                <Text key={idx}>- {p.nombreEquipo} ({p.codigoBarras})</Text>
              ))
            ) : (
              <Text style={{ marginLeft: 10 }}>Ninguno</Text>
            )}
            <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Accesorios:</Text>
            {resultado.accesorios && resultado.accesorios.length > 0 ? (
              resultado.accesorios.map((a: any, idx: number) => (
                <Text key={idx}>- {a.nombreAccs} ({a.codigoBarrasAccs})</Text>
              ))
            ) : (
              <Text style={{ marginLeft: 10 }}>Ninguno</Text>
            )}
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>

      <View style={styles.searchContainer}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#f2f2f2',
          borderRadius: 10,
          margin: 16,
          padding: 4,
        }}>
          <TouchableOpacity
            style={[styles.tipoButton, tipoBusqueda === 'producto' && styles.tipoButtonActive]}
            onPress={() => setTipoBusqueda('producto')}
          >
            <Text style={[styles.tipoButtonText, tipoBusqueda === 'producto' && styles.tipoButtonTextActive]}>
              Dispositivo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoButton, tipoBusqueda === 'accesorio' && styles.tipoButtonActive]}
            onPress={() => setTipoBusqueda('accesorio')}
          >
            <Text style={[styles.tipoButtonText, tipoBusqueda === 'accesorio' && styles.tipoButtonTextActive]}>
              Accesorio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoButton, tipoBusqueda === 'movimiento' && styles.tipoButtonActive]}
            onPress={() => setTipoBusqueda('movimiento')}
          >
            <Text style={[styles.tipoButtonText, tipoBusqueda === 'movimiento' && styles.tipoButtonTextActive]}>
              Movimiento
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={tipoBusqueda === 'movimiento' ? "Ingrese el ID" : "Ingrese el código de barras"}
            value={busqueda}
            onChangeText={setBusqueda}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleBuscar}>
            <MaterialIcons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {renderResultado()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    padding: 20,
  },
  tipoBusquedaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  tipoButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tipoButtonActive: {
    backgroundColor: '#007AFF',
  },
  tipoButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  tipoButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  resultadoContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultadoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
}); 