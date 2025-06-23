import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';

interface TipoSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TipoSelector({ value, onChange }: TipoSelectorProps) {
  const tipos = ['Nuevo', 'Seminuevo', 'Open Box'];

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione el tipo" value="" />
        {tipos.map((tipo) => (
          <Picker.Item
            key={tipo}
            label={tipo}
            value={tipo}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  picker: {
    height: 50,
  },
}); 