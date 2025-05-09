import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
          size={24}
          color={tipoSeleccionado === 'dispositivos' ? '#007AFF' : '#666'}
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
          size={24}
          color={tipoSeleccionado === 'accesorios' ? '#007AFF' : '#666'}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 8,
    justifyContent: 'space-around',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedText: {
    color: '#007AFF',
  },
}); 