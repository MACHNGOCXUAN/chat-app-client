import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';

const ButtonSheet = ({ visible, onClose, onSelect }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={[styles.textHeader, { color: 'gray' }]}>Sắp xếp theo</Text>
          <Pressable style={styles.textView} onPress={() => onSelect('Hoạt động cuối')}>
            <Text style={styles.textItem}>Hoạt động cuối</Text>
          </Pressable>
          <Pressable style={styles.textView} onPress={() => onSelect('Tên nhóm')}>
            <Text style={styles.textItem}>Tên nhóm</Text>
          </Pressable>
          <Pressable onPress={() => onSelect('Nhóm quản lý')}>
            <Text style={styles.textItem}>Nhóm quản lý</Text>
          </Pressable>
        </View>

        <Pressable style={styles.sheet} onPress={onClose}>
          <Text style={styles.button}>Hủy</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default ButtonSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  button: {
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: "#297EFF"
  },
  textHeader: {
    fontSize: 15,
    borderBottomWidth: 0.2,
    width: '100%', 
    textAlign: 'center', 
    paddingVertical: 10,
    borderColor: 'gray'
  },
  textView: {
    width: '100%', 
  },
  textItem: {
    fontSize: 20,
    color: '#297EFF',
    width: '100%', 
    textAlign: 'center', 
    paddingVertical: 8,
    borderBottomWidth: 0.2,
    borderColor: 'gray'
  }
});
