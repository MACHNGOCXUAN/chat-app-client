import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActionSheetIOS,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import { router, useLocalSearchParams } from "expo-router";
import socket from "../utils/socket";

const MessageSection = ({ conversationId, messages, setMessages }) => {
  const params = useLocalSearchParams();
  // const conversationId = params.conversationId;
  // const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  // const [messages, setMessages] = useState([])

  const currentUserId = user._id;

  const fetchMessageConversation = async (conversationId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/message/${conversationId}`
      );
      // Sắp xếp messages theo timestamp
      const sortedMessages = response.data.data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.log("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessageConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        // Kiểm tra xem đã có tin nhắn này chưa (dựa vào _id)
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === newMessage._id);
          if (!exists) {
            // Sắp xếp lại messages theo timestamp
            const updatedMessages = [...prev, newMessage].sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
            return updatedMessages;
          }
          return prev;
        });
      }
    };

    const handleRecallMessageUpdate = (updatedMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    };

    const handleGroupSettingsUpdated = (data) => {
      if (data.conversationId === conversationId) {
        // Cập nhật lại messages khi có thay đổi quyền
        fetchMessageConversation(conversationId);
      }
    };

    const handleRemovieMember = (data) => {
      if(data.conversationId) {
        fetchMessageConversation(conversationId)
        if(user._id == data.removedMemberId) {
          router.replace("/(tabs)/")
        }
      }
    }

    const handleRemovieMembe = (data) => {
      if(data.conversationId) {
        fetchMessageConversation(conversationId)
      }
    }

    const handleAddMember = (data) => {
      fetchMessageConversation(data.conversationId)
    }

    socket.on("message_sent", handleNewMessage);
    socket.on("receive_message", handleNewMessage);
    socket.on("message_recalled", handleRecallMessageUpdate);
    socket.on("group_settings_updated", handleGroupSettingsUpdated);
    socket.on("member_removed", handleRemovieMember)
    socket.on("you_were_removed", handleRemovieMembe)
    socket.on("new_message", handleAddMember)

    return () => {
      socket.off("message_sent", handleNewMessage);
      socket.off("receive_message", handleNewMessage);
      socket.off("message_recalled", handleRecallMessageUpdate);
      socket.off("group_settings_updated", handleGroupSettingsUpdated);
    };
  }, [conversationId, socket]);

  const handleRecallMessage = (messageId) => {
    socket.emit("recall_message", {
      messageId,
      conversationId,
    });
  };

  const showMessageActions = (message) => {

    const options = ["Chuyển tiếp"];
    if (message.senderId._id === currentUserId) options.push("Thu hồi");
    options.push("Hủy");
    const cancelButtonIndex = options.length - 1;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (options[buttonIndex] === "Thu hồi") {
            handleRecallMessage(message._id);
          } else if (options[buttonIndex] === "Chuyển tiếp") {
            router.push({
              pathname: "/(main)/ForwardMessage",
              params: {
                message: JSON.stringify(message),
              }
            })
          }
        }
      );
    } else {
      Alert.alert("Hành động", "Chọn thao tác", [
        ...(message.senderId._id === currentUserId
          ? [
            {
              text: "Thu hồi",
              onPress: () => handleRecallMessage(message._id),
            },
          ]
          : []),
        {
          text: "Chuyển tiếp",
          onPress: () => {
            router.push({
              pathname: "/(main)/ForwardMessage",
            })
          },
        },
        { text: "Hủy", style: "cancel" },
      ]);
    }
  };

  const renderImages = (images) => {
    if (!Array.isArray(images)) images = [images]; // Đảm bảo luôn là mảng

    return (
      <View className='grid grid-cols-2 gap-1'>
        {images.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={[
              styles.messageImage,
              images.length === 1 ? styles.singleImage : styles.multiImage
            ]}
            resizeMode="cover"
          />
        ))}
      </View>
    );
  };

  const renderMessage = (message, index) => {
    const isSentByMe = message.senderId._id === currentUserId;
    const isSystemMessage = message.messageType === "system";

    if (isSystemMessage) {
      return (
        <View key={`${message._id}-${index}`} style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{message.content}</Text>
        </View>
      );
    }

    return (
      <Pressable
        onLongPress={() => showMessageActions(message)}
        key={`${message._id}-${index}`}
        style={[
          styles.messageContainer,
          isSentByMe ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        {!isSentByMe && (
          <View style={styles.avatarContainer}>
            {message.senderId.avatarURL ? (
              <Image
                source={{ uri: message.senderId.avatarURL }}
                style={styles.avatar}
                onError={() =>
                  console.log(
                    "Error loading avatar for:",
                    message.senderId.username
                  )
                }
              />
            ) : (
              <Text style={styles.avatarText}>
                {message.senderId.username.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isSentByMe ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          {message.messageType === "text" ? (
            <Text
              style={[
                styles.messageText,
                isSentByMe ? styles.sentMessageText : styles.receivedMessageText,
              ]}
            >
              {message.content}
            </Text>
          ) : (
            renderImages(message.content)
          )}
          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  sentMessage: {
    justifyContent: "flex-end",
  },
  receivedMessage: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    fontWeight: "bold",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 12,
  },
  sentBubble: {
    backgroundColor: "#0084ff",
    borderBottomRightRadius: 0,
  },
  receivedBubble: {
    backgroundColor: "#e0e0e0",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  sentMessageText: {
    color: "#fff",
  },
  receivedMessageText: {
    color: "#666",
  },
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  sentTimestamp: {
    color: "rgba(255,255,255,0.7)",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },

  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  singleImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  multiImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  fileIconContainer: {
    marginRight: 10,
  },
  fileName: {
    color: '#fff',
    flexShrink: 1,
  },

  // Thêm style cho video preview nếu cần
  videoContainer: {
    position: 'relative',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  systemMessageText: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: "#666",
    fontSize: 12,
  },
});

export default MessageSection;
