import React from 'react';
import { StyleSheet, View } from 'react-native';
import MovimientoForm from '../../components/MovimientoForm';

const NuevoMovimientoScreen = () => {
  return (
    <View style={styles.container}>
      <MovimientoForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default NuevoMovimientoScreen;