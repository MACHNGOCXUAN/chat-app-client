import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InputSend = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    
    if (message.trim()) {
      onSend(message);
      setMessage('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton}>
        <Icon name="insert-emoticon" size={24} color="#666" />
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#999"
        multiline
      />

      <TouchableOpacity style={styles.iconButton}>
        <Icon name="attach-file" size={24} color="#666" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.sendButton} 
        onPress={handleSend}
        disabled={!message.trim()}
      >
        <Icon 
          name={message.trim() ? "send" : "mic"} 
          size={24} 
          color={message.trim() ? "#2e86de" : "#666"} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
  },
});

export default InputSend;