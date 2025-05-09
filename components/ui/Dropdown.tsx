import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Menu, Button } from 'react-native-paper';

interface DropdownProps {
  options: Array<{ label: string; value: any }>;
  onSelect: (value: any) => void;
  placeholder?: string;
  selectedValue?: any;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  placeholder = 'Seleccionar',
  selectedValue,
}) => {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<View>(null);
  const selectedOption = options.find(option => option.value === selectedValue);

  const showMenu = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setVisible(true);
    });
  };

  const closeMenu = () => setVisible(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button 
            mode="outlined" 
            onPress={showMenu}
            ref={buttonRef}
            style={styles.button}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Button>
        }
        style={styles.menu}
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => {
              onSelect(option.value);
              closeMenu();
            }}
            title={option.label}
          />
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    width: '100%',
    marginVertical: 8,
  },
  menu: {
    marginTop: Platform.OS === 'android' ? 35 : 0,
  },
});

export default Dropdown; 