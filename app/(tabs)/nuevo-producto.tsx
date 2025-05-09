import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import ProductoForm from '../../components/ProductoForm';

export default function NuevoProductoScreen() {
  return (
    <View style={styles.container}>
      <ProductoForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});  