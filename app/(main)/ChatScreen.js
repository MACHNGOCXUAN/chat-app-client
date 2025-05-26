import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import InputSend from "../../components/InputSend";
import MessageSection from "../../components/MessageSection";
import { useLocalSearchParams, router } from "expo-router";
import socket from "../../utils/socket";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { appColors } from "../../constants/appColor";
import axiosInstance from "../../utils/axiosInstance";

const ChatScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const conversation = params.conversation
    ? JSON.parse(params.conversation)
    : null;
  const [conversationId, setConversationId] = useState(
    conversation?._id || null
  );
  const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
  const [messages, setMessages] = useState([]);
  const [isGroupDisbanded, setIsGroupDisbanded] = useState(false);

  useEffect(() => {
    if (conversation && conversation.type === "group") {
      // Kiểm tra trạng thái nhóm
      setIsGroupDisbanded(!conversation.isActive);
    }
  }, [conversation]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    // Nếu là chat 1-1
    if (otherUser?._id && !conversation) {
      socket.emit("join_conversation", {
        senderId: user._id,
        receiveId: otherUser._id,
        conversationId: conversationId,
      });
    }
    // Nếu là chat nhóm
    else if (conversationId) {
      socket.emit("join_group_conversation", {
        conversationId: conversationId,
        userId: user._id,
      });
    }

    socket.emit("joinUserRoom", user._id);

    // Lắng nghe sự kiện khi join room thành công
    socket.on("joined_room", (data) => {
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    });

    // Lắng nghe khi conversation mới được tạo
    socket.on(
      "conversation_created",
      ({ conversationId: newConversationId }) => {
        setConversationId(newConversationId);
      }
    );

    socket.on("group_disbanded", (dissolvedData) => {
      if (dissolvedData.conversationId === conversationId) {
        setIsGroupDisbanded(true);
        setTimeout(() => {
          router.replace("/(tabs)/")
        }, 2000);
      }
    });

    return () => {
      socket.off("joined_room");
      socket.off("conversation_created");
      socket.off("group_disbanded");
    };
  }, [otherUser, conversationId, user, conversation, conversation?.isActive]);

  const handleSendMessage = async (messageContent) => {
    if (isGroupDisbanded) {
      Alert.alert("Thông báo", "Không thể gửi tin nhắn vì nhóm đã bị giải tán");
      return;
    }

    if (user?._id && socket) {
      if (messageContent.type === "text") {
        socket.emit("sendMessage", {
          conversationId,
          senderId: user._id,
          rereceiveId: otherUser?._id,
          content: messageContent.message,
          messageType: "text",
        });
      } else {
        try {
          const response = await axiosInstance.post(
            "/api/message/uploadNhieuFile",
            messageContent.image,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data.success) {
            socket.emit("sendMessage", {
              conversationId,
              senderId: user._id,
              rereceiveId: otherUser._id,
              content: response.data.data,
              messageType: "image",
            });
          }
        } catch (error) {
          console.error("Upload error:", error);
        }
      }
    }
  };

  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      requestAnimationFrame(() => {
        scrollViewRef.current.scrollToEnd({ animated: false });
      });
    }
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && messages.length > 0) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (isGroupDisbanded) {
  return (
    <SafeAreaView className="h-full w-full bg-white justify-center items-center px-4">
      <MaterialIcons name="group-off" size={64} color="gray" />
      <Text className="text-lg font-semibold mt-4 text-center text-gray-600">
        Nhóm đã bị giải tán bởi quản trị viên
      </Text>
    </SafeAreaView>
  );
}


  return (
    <SafeAreaView className="h-full w-full">
      <ScrollView
        className="p-1 flex-1"
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
      >
        <MessageSection
          conversationId={conversationId}
          messages={messages}
          setMessages={setMessages}
        />
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <InputSend
          onSend={handleSendMessage}
          conversation={conversation}
          socket={socket}
          disabled={isGroupDisbanded}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
  },
});

export default ChatScreen;
