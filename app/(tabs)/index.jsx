import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import avatar from '../../assets/images/avatar.png'
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import socket from '../../utils/socket';
import * as Sharing from 'expo-sharing';

const ChatListScreen = () => {
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Nguyễn Văn A', avatar: avatar, lastMessage: 'Bạn đang làm gì thế?', time: '10:02 AM', unread: 2 },
    { id: 2, name: 'Trần Thị B', avatar: avatar, lastMessage: 'Ok bạn, hẹn gặp lại', time: '9:45 AM', unread: 0 },
    { id: 3, name: 'Nhóm Đồ Án', avatar: avatar, lastMessage: 'Mọi người họp lúc 3h chiều nhé', time: 'Hôm qua', unread: 5 },
    { id: 4, name: 'Lê Văn C', avatar: avatar, lastMessage: 'Gửi cho mình file báo cáo nhé', time: 'Hôm qua', unread: 0 },
    { id: 5, name: 'Đặng Thị D', avatar: avatar, lastMessage: 'Đã nhận được hàng chưa?', time: '24/11', unread: 0 },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Handle search function for Header
  const handleSearch = (text) => {
    if (text.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Filter conversations that include the search text
    const filteredConversations = conversations.filter(
      convo => convo.name.toLowerCase().includes(text.toLowerCase()) ||
        convo.lastMessage.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults(filteredConversations);
  };

  const openChat = (conversation) => {
    setSelectedChat(conversation);
  };

  const backToList = () => {
    setSelectedChat(null);
  };

  // Render an individual conversation item
  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={item.avatar} style={styles.avatar} />
        {item.unread > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.name}</Text>
          <Text style={styles.conversationTime}>{item.time}</Text>
        </View>
        <Text
          style={[
            styles.conversationMessage,
            item.unread > 0 && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // If a chat is selected, show the chat detail view
  if (selectedChat) {
    return <ChatDetailScreen conversation={selectedChat} onBack={backToList} />;
  }

  // Otherwise show the conversation list
  return (
    <View style={styles.container}>
      <Header
        title="Tin nhắn"
        isFocus={isFocus}
        setIsFocus={setIsFocus}
        onSearch={handleSearch}
      />

      <FlatList
        data={isFocus && searchResults.length > 0 ? searchResults : conversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// Chat detail screen component
const ChatDetailScreen = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Chào bạn!', sender: 'other', timestamp: '10:00 AM', isFile: false },
    { id: 2, text: 'Chào bạn, mình khoẻ cảm ơn', sender: 'me', timestamp: '10:01 AM', isFile: false },
    { id: 3, text: 'Bạn đang làm gì thế?', sender: 'other', timestamp: '10:02 AM', isFile: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [conversationList, setConversationList] = useState([
    { id: 1, name: 'Nguyễn Văn A', avatar: avatar },
    { id: 2, name: 'Trần Thị B', avatar: avatar },
    { id: 3, name: 'Nhóm Đồ Án', avatar: avatar },
    { id: 4, name: 'Lê Văn C', avatar: avatar },
    { id: 5, name: 'Đặng Thị D', avatar: avatar },
  ]);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Emoji collection for the picker
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '👍', '👎', '❤️', '🔥', '🎉', '🤔', '👏', '🙏', '🥺', '😢'];

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFile: false
    };

    setMessages([...messages, newMessage]);
    socket.emit('message', newMessage);
    setInputMessage('');
    setShowEmojiPicker(false);
    setShowAttachmentOptions(false);
  };

  const addEmoji = (emoji) => {
    setInputMessage(prev => prev + emoji);
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        console.log("Image selected:", result.assets[0].uri);

        const newMessage = {
          id: messages.length + 1,
          text: result.assets[0].uri,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFile: true,
          fileType: 'image'
        };

        setMessages(prev => [...prev, newMessage]);

        socket.emit('fileMessage', {
          ...newMessage,
          fileData: result.assets[0].base64,
          fileName: `image_${Date.now()}.jpg`,
          mimeType: 'image/jpeg'
        });

        console.log("Image sent successfully");
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
    setShowAttachmentOptions(false);
  };

  const pickDocument = async () => {
    try {
      console.log("Starting document picker...");
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      console.log("Document picker result:", result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        console.log("Document selected successfully:", {
          name: file.name,
          size: file.size,
          uri: file.uri,
          mimeType: file.mimeType
        });

        const fileUri = file.uri;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSize = file.size;
        const fileName = file.name;

        // Create a new message object with file details
        const newMessage = {
          id: messages.length + 1,
          text: fileUri,
          name: fileName,
          size: fileSize,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFile: true,
          fileType: 'document',
          mimeType: file.mimeType || `application/${fileExtension}`
        };

        console.log("Created new message object:", newMessage);

        // Add message to local state
        setMessages(prev => {
          console.log("Updating messages state...");
          return [...prev, newMessage];
        });

        // Prepare file data for socket
        const fileData = {
          ...newMessage,
          fileName: fileName,
          mimeType: file.mimeType || `application/${fileExtension}`,
          size: fileSize,
          fileUri: fileUri,
          conversationId: conversation.id // Add conversation ID
        };

        console.log("Emitting file message to socket:", fileData);

        // Emit the file message to the socket
        socket.emit('fileMessage', fileData);

        console.log("Document sent successfully");
      } else {
        console.log("Document selection cancelled or failed");
      }
    } catch (error) {
      console.error("Error in pickDocument:", error);
    }
    setShowAttachmentOptions(false);
  };

  // Add document viewing functionality
  const viewDocument = async (fileUri, fileName) => {
    try {
      console.log("Attempting to view document:", { fileUri, fileName });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: `View ${fileName}`,
        UTI: 'public.pdf'
      });
      console.log("Document shared successfully");
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };

  // Add socket listener for file messages
  useEffect(() => {
    console.log("Setting up file message socket listener");

    socket.on('fileMessage', (data) => {
      console.log("Received file message:", data);
      setMessages(prev => [...prev, data]);
    });

    socket.on('fileMessageError', (error) => {
      console.error("File message error:", error);
    });

    return () => {
      console.log("Cleaning up file message socket listeners");
      socket.off('fileMessage');
      socket.off('fileMessageError');
    };
  }, []);

  // Add message options handlers
  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setShowMessageOptions(true);
  };

  const handleRecallMessage = async () => {
    try {
      console.log("Recalling message:", selectedMessage);
      socket.emit('recall_message', {
        messageId: selectedMessage.id,
        conversationId: conversation.id
      });
      setShowMessageOptions(false);
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  };

  const handleDeleteMessage = async () => {
    try {
      console.log("Deleting message:", selectedMessage);
      socket.emit('delete_message', {
        messageId: selectedMessage.id,
        conversationId: conversation.id
      });
      setShowMessageOptions(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleForwardMessage = () => {
    setShowForwardModal(true);
    setShowMessageOptions(false);
  };

  // Add socket listeners for message actions
  useEffect(() => {
    socket.on('message_recalled', (data) => {
      console.log("Message recalled:", data);
      setMessages(prev => prev.map(msg =>
        msg.id === data.id ? { ...msg, text: 'Tin nhắn đã được thu hồi', isRecalled: true } : msg
      ));
    });

    socket.on('message_deleted', (data) => {
      console.log("Message deleted:", data);
      setMessages(prev => prev.filter(msg => msg.id !== data.id));
    });

    socket.on('message_forwarded', (data) => {
      console.log("Message forwarded:", data);
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('message_recalled');
      socket.off('message_deleted');
      socket.off('message_forwarded');
    };
  }, []);

  // Modify renderMessageItem to include long press handler
  const renderMessageItem = ({ item }) => {
    const isMe = item.sender === 'me';

    return (
      <TouchableOpacity
        onLongPress={() => handleMessageLongPress(item)}
        style={{
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          marginVertical: 5,
          maxWidth: '80%',
          marginHorizontal: 10
        }}
      >
        {!isMe && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Image source={avatar} style={{ width: 30, height: 30, borderRadius: 15, marginRight: 5 }} />
            <Text style={{ fontSize: 12, color: '#888' }}>Người gửi</Text>
          </View>
        )}

        {item.isFile ? (
          item.fileType === 'image' ? (
            <View style={{
              backgroundColor: isMe ? '#0084ff' : '#f0f0f0',
              borderRadius: 15,
              padding: 2,
              overflow: 'hidden'
            }}>
              <Image
                source={{ uri: item.text }}
                style={{ width: 200, height: 200, borderRadius: 13 }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => viewDocument(item.text, item.name)}
              style={{
                backgroundColor: isMe ? '#0084ff' : '#f0f0f0',
                borderRadius: 15,
                padding: 10,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Ionicons name="document-outline" size={24} color={isMe ? "#fff" : "#555"} />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ color: isMe ? '#fff' : '#000', fontWeight: 'bold' }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: isMe ? '#eee' : '#888', fontSize: 12 }}>{Math.round(item.size / 1024)} KB</Text>
              </View>
            </TouchableOpacity>
          )
        ) : (
          <View style={{
            backgroundColor: isMe ? '#0084ff' : '#f0f0f0',
            borderRadius: 20,
            padding: 10,
          }}>
            <Text style={{
              color: isMe ? '#fff' : '#000',
              textDecorationLine: item.isRecalled ? 'line-through' : 'none',
              opacity: item.isRecalled ? 0.5 : 1
            }}>{item.text}</Text>
          </View>
        )}

        <Text style={{
          fontSize: 10,
          color: '#888',
          marginTop: 2,
          alignSelf: isMe ? 'flex-end' : 'flex-start'
        }}>
          {item.timestamp}
        </Text>
      </TouchableOpacity>
    );
  };

  // Add Message Options Modal
  const MessageOptionsModal = () => (
    <Modal
      visible={showMessageOptions}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMessageOptions(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedMessage?.sender === 'me' && (
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleRecallMessage}
            >
              <Ionicons name="arrow-undo" size={24} color="#000" />
              <Text style={styles.modalOptionText}>Thu hồi tin nhắn</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={handleDeleteMessage}
          >
            <Ionicons name="trash-outline" size={24} color="#ff3b30" />
            <Text style={[styles.modalOptionText, { color: '#ff3b30' }]}>Xóa tin nhắn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={handleForwardMessage}
          >
            <Ionicons name="arrow-redo" size={24} color="#000" />
            <Text style={styles.modalOptionText}>Chuyển tiếp tin nhắn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => setShowMessageOptions(false)}
          >
            <Text style={styles.modalOptionText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Add Forward Modal
  const ForwardModal = () => (
    <Modal
      visible={showForwardModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowForwardModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chuyển tiếp tin nhắn</Text>
          <FlatList
            data={conversationList.filter(conv => conv.id !== conversation.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.forwardItem}
                onPress={() => {
                  socket.emit('forward_message', {
                    message: selectedMessage,
                    toConversationId: item.id
                  });
                  setShowForwardModal(false);
                }}
              >
                <Image source={item.avatar} style={styles.forwardAvatar} />
                <Text style={styles.forwardName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id.toString()}
          />
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => setShowForwardModal(false)}
          >
            <Text style={styles.modalOptionText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: '#fff', marginTop: 35 }}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Image source={conversation.avatar} style={styles.headerAvatar} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{conversation.name}</Text>
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={22} color="#0084ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam-outline" size={22} color="#0084ff" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingTop: 30, paddingBottom: 10 }}
        />

        {showEmojiPicker && (
          <View style={styles.emojiPicker}>
            <FlatList
              data={emojis}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.emojiButton}
                  onPress={() => addEmoji(item)}
                >
                  <Text style={{ fontSize: 24 }}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={5}
            />
          </View>
        )}

        {showAttachmentOptions && (
          <View style={styles.attachmentOptions}>
            <TouchableOpacity style={styles.attachmentOption} onPress={pickImage}>
              <View style={[styles.attachmentIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="image" size={22} color="#fff" />
              </View>
              <Text style={styles.attachmentText}>Hình ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={pickDocument}>
              <View style={[styles.attachmentIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="document-text" size={22} color="#fff" />
              </View>
              <Text style={styles.attachmentText}>Tài liệu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption}>
              <View style={[styles.attachmentIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="location" size={22} color="#fff" />
              </View>
              <Text style={styles.attachmentText}>Vị trí</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowAttachmentOptions(!showAttachmentOptions);
              setShowEmojiPicker(false);
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0084ff" />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentOptions(false);
            }}
          >
            <Entypo name="emoji-happy" size={24} color="#0084ff" />
          </TouchableOpacity>

          {inputMessage.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="microphone" size={24} color="#0084ff" />
            </TouchableOpacity>
          )}
        </View>

        <MessageOptionsModal />
        <ForwardModal />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  // Chat list styles
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingVertical: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationTime: {
    fontSize: 12,
    color: '#888',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '500',
  },

  // Chat detail styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  headerButton: {
    padding: 8,
  },

  // Message input and emoji picker
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#0084ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emojiPicker: {
    height: 200,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  emojiButton: {
    width: '20%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentOptions: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  attachmentOption: {
    alignItems: 'center',
    marginRight: 25,
  },
  attachmentIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  attachmentText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  forwardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  forwardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  forwardName: {
    fontSize: 16,
  },
});
