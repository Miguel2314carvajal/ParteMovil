import React from 'react';
import { StyleSheet, View } from 'react-native';
import MovimientoForm from '../../components/MovimientoForm';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NuevoMovimientoScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MovimientoForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});

export default NuevoMovimientoScreen;