import React from 'react';
import { View, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import Barcode from 'react-native-barcode-svg';

export interface CodigoBarrasProps {
    codigo: string | null;
    containerStyle?: StyleProp<ViewStyle>;
}

const CodigoBarras: React.FC<CodigoBarrasProps> = ({ codigo, containerStyle }) => {
    if (!codigo) {
        return null;
    }

    return (
        <View style={[styles.container, containerStyle]}>
            <Barcode value={codigo} format="EAN13" height={80} />
            <Text style={styles.codigo}>{codigo}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    codigo: {
        fontSize: 16,
        marginVertical: 10,
        letterSpacing: 2,
    },
});

export default CodigoBarras; 