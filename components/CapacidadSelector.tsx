import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CapacidadSelectorProps {
  value: string;
  onChange: (value: string) => void;
  categoria: string;
}

export default function CapacidadSelector({ value, onChange, categoria }: CapacidadSelectorProps) {
  let opciones: string[] = [];

  const categoriaStr = String(categoria || '');
  if (categoriaStr.toLowerCase() === 'macbook') {
    opciones = [
      '512GB y 16GB RAM',
      '512GB y 8GB RAM',
      '1TB y 32GB RAM'
    ];
  } else if (categoriaStr.toLowerCase() === 'apple watch') {
    opciones = [
      '32GB',
      '64GB'
    ];
  } else {
    opciones = [
      '16GB',
      '32GB',
      '64GB',
      '128GB',
      '256GB',
      '512GB',
      '1TB'
    ];
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione la capacidad" value="" />
        {opciones.map((capacidad) => (
          <Picker.Item
            key={capacidad}
            label={capacidad}
            value={capacidad}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: 50,
  },
}); 