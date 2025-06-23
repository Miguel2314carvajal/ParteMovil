import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface TipoProductoSelectorProps {
  tipoSeleccionado: 'dispositivos' | 'accesorios' | null;
  onSelect: (tipo: 'dispositivos' | 'accesorios') => void;
}

export default function TipoProductoSelector({ tipoSeleccionado, onSelect }: TipoProductoSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          tipoSeleccionado === 'dispositivos' && styles.selected,
        ]}
        onPress={() => onSelect('dispositivos')}
      >
        <MaterialIcons
          name="devices"
          size={20}
          color={tipoSeleccionado === 'dispositivos' ? Colors.light.buttonText : Colors.light.text}
        />
        <Text
          style={[
            styles.optionText,
            tipoSeleccionado === 'dispositivos' && styles.selectedText,
          ]}
        >
          Dispositivos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          tipoSeleccionado === 'accesorios' && styles.selected,
        ]}
        onPress={() => onSelect('accesorios')}
      >
        <MaterialIcons
          name="headset"
          size={20}
          color={tipoSeleccionado === 'accesorios' ? Colors.light.buttonText : Colors.light.text}
        />
        <Text
          style={[
            styles.optionText,
            tipoSeleccionado === 'accesorios' && styles.selectedText,
          ]}
        >
          Accesorios
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: 30,
    marginBottom: 24,
    padding: 6,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  selected: {
    backgroundColor: Colors.light.button,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  selectedText: {
    color: Colors.light.buttonText,
  },
}); 