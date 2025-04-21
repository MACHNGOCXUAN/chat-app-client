import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";

const InputSend = ({ onSend }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // const [image, setImage] = useState(null);
  const [image, setImage] = useState([]);
  const [imageURI, setImageURI] = useState([]);
  const inputRef = useRef();
  

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true, // cho phép cắt sửa ảnh
      // aspect: [1, 1], // tỉ lệ 1:1 vuông
      allowsMultipleSelection: true, // cho phép chọn nhiều ảnh
      quality: 1, // chất lượng ảnh
    });

    if (!result.canceled) {
      // setImage(result.assets[0].uri);

      const uris = result.assets.map((asset) => asset.uri);
      setImage((prev) => [...prev, ...uris]);
    }
  };
  useEffect(() => {
    if (image.length > 0) {
      const formData = new FormData();
      image.forEach((uri, index) => {
        const fileName = uri.split("/").pop() || `image-${index}.jpg`;
        const fileType = uri.split(".").pop() || "jpg";
        const mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;

        formData.append("ArrayFile", {
          uri,
          name: fileName,
          type: mimeType,
        });
      });
      setImageURI(formData);
    }
  }, [image]);

  const handleSend = () => {
    if (image.length > 0) {
      onSend({ image: imageURI, type: "image" });
      setImage([]);
      setImageURI(null);
    }

    if (message.trim()) {
      onSend({ message, type: "text" });
      setMessage("");
    }

    setShowEmojiPicker(false);
    Keyboard.dismiss();
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

  const handleRemoveImage = (index) => {
    setImage((prev) => prev.filter((_, i) => i !== index));
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
      {image.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginHorizontal: 10,
          }}
        >
          {image.map((uri, index) => (
            <View key={index} style={styles.previewContainer}>
              <Image source={{ uri }} style={styles.previewImage} />
              <TouchableOpacity
                onPress={() => handleRemoveImage(index)}
                style={styles.removeImageButton}
              >
                <Icon name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={handleEmojiPress}>
          <Icon
            name="insert-emoticon"
            size={24}
            color={showEmojiPicker ? "#2e86de" : "#666"}
          />
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
          disabled={!message.trim() && image.length === 0}
        >
          <Icon
            name={message.trim() || image.length > 0 ? "send" : "mic"}
            size={24}
            color={message.trim() || image.length > 0 ? "#2e86de" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 10 : 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  iconButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
  },
  previewContainer: {
    position: "relative",
    alignSelf: "flex-start",
    margin: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 2,
  },
});

export default InputSend;
