import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DetalleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  details: Record<string, string | number | null | undefined>;
}

const DetalleModal: React.FC<DetalleModalProps> = ({ visible, onClose, title, details }) => {
  const detailItems = Object.entries(details).filter(([, value]) => value || value === 0);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.detailsScrollView} contentContainerStyle={styles.detailsContainer}>
            {detailItems.map(([key, value]) => (
              <View style={styles.detailRow} key={key}>
                <Text style={styles.detailLabel}>{key}:</Text>
                <Text style={styles.detailValue}>{String(value)}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  detailsScrollView: {
    marginBottom: 20,
  },
  detailsContainer: {
    paddingRight: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.placeholder,
    flexShrink: 1,
    textAlign: 'right',
  },
  closeButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  closeButtonText: {
    color: Colors.light.buttonText,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DetalleModal; 