import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Keyboard, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmojiSelector from 'react-native-emoji-selector';
import * as ImagePicker from 'expo-image-picker';

const InputSend = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [imageURI, setImageURI] = useState("");
  const inputRef = useRef();

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  useEffect(() => {
    if (image) {
      const fileName = image.split('/').pop() || 'avatar.jpg';
      const fileType = image.split('.').pop() || 'jpg';
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
  
      const formData = new FormData();
      formData.append("avatarURL", {
        uri: image,
        name: fileName,
        type: mimeType,
      });
  
      setImageURI(formData);
    }
  }, [image]);

  const handleSend = () => {
    if (image) {
      onSend({ image: imageURI, type: 'image' });
      setImage(null);
      setShowEmojiPicker(false);
      Keyboard.dismiss();
    } else if (message.trim()) {
      onSend({ message, type: 'text' });
      setMessage('');
      setShowEmojiPicker(false);
      Keyboard.dismiss();
    }
  };

  const handleEmojiPress = () => {
    setShowEmojiPicker(!showEmojiPicker);
    if (!showEmojiPicker) {
      Keyboard.dismiss();
    } else {
      inputRef.current?.focus();
    }
  };

  const handleEmojiSelected = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <>
      {showEmojiPicker && (
        <EmojiSelector
          onEmojiSelected={handleEmojiSelected}
          showSearchBar={false}
          columns={8}
          style={{ height: 250 }}
        />
      )}

      {/* Hiển thị ảnh preview nếu có */}
      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
            <Icon name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={handleEmojiPress}>
          <Icon name="insert-emoticon" size={24} color={showEmojiPicker ? "#2e86de" : "#666"} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          ref={inputRef}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          multiline
          onFocus={() => setShowEmojiPicker(false)}
        />

        <TouchableOpacity style={styles.iconButton} onPress={pickAvatar}>
          <Icon name="attach-file" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!message.trim() && !image}
        >
          <Icon
            name={message.trim() || image ? "send" : "mic"}
            size={24}
            color={message.trim() || image ? "#2e86de" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </>
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
  previewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    margin: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
  },
});

export default InputSend;
