import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { categoriaService } from '../services/api';

interface Categoria {
  _id: string;
  nombreCategoria: string;
  descripcionCategoria: string;
}

interface CategoriaSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategoriaSelector({ value, onChange }: CategoriaSelectorProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await categoriaService.obtenerCategorias();
      setCategorias(data);
    } catch (error: any) {
      setError('Error al cargar las categorías');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Cargando categorías...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione una categoría" value="" />
        {categorias.map((categoria) => (
          <Picker.Item
            key={categoria._id}
            label={categoria.nombreCategoria}
            value={categoria.nombreCategoria}  // Enviamos el nombre de la categoría
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
});