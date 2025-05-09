import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import EscanerCodigoBarras from './EscanerCodigoBarras';

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
  const [areaSalida, setAreaSalida] = useState('');
  const [observacion, setObservacion] = useState('');

  const handleCodigoEscaneado = (codigo: string) => {
    // Aquí deberías hacer una llamada a la API para obtener los detalles del producto/accesorio
    if (tipoEscaner === 'producto') {
      setProductos([...productos, {
        codigoBarras: codigo,
        nombreEquipo: 'Nombre del equipo', // Esto vendría de la API
        capacidad: 'Capacidad', // Esto vendría de la API
        color: 'Color', // Esto vendría de la API
        codigoSerial: 'Serial' // Esto vendría de la API
      }]);
    } else {
      setAccesorios([...accesorios, {
        codigoBarrasAccs: codigo,
        nombreAccs: 'Nombre del accesorio' // Esto vendría de la API
      }]);
    }
    setMostrarEscaner(false);
  };

  const handleSubmit = async () => {
    // Aquí deberías hacer la llamada a la API para guardar el movimiento
    const movimiento = {
      productos,
      accesorios,
      areaLlegada,
      areaSalida,
      observacion,
      fecha: new Date()
    };
    console.log('Movimiento a guardar:', movimiento);
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
        <Card.Title title="Productos" />
        <Card.Content>
          {productos.map((producto, index) => (
            <View key={index} style={styles.item}>
              <Text>Código: {producto.codigoBarras}</Text>
              <Text>Nombre: {producto.nombreEquipo}</Text>
              <Text>Capacidad: {producto.capacidad}</Text>
              <Text>Color: {producto.color}</Text>
              <Text>Serial: {producto.codigoSerial}</Text>
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
            Agregar Producto
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="Accesorios" />
        <Card.Content>
          {accesorios.map((accesorio, index) => (
            <View key={index} style={styles.item}>
              <Text>Código: {accesorio.codigoBarrasAccs}</Text>
              <Text>Nombre: {accesorio.nombreAccs}</Text>
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
          <TextInput
            label="Área de Salida"
            value={areaSalida}
            onChangeText={setAreaSalida}
            style={styles.input}
          />
          <TextInput
            label="Área de Llegada"
            value={areaLlegada}
            onChangeText={setAreaLlegada}
            style={styles.input}
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