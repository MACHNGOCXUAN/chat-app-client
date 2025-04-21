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
} from "react-native";
import InputSend from "../../components/InputSend";
import MessageSection from "../../components/MessageSection";
import { useLocalSearchParams } from "expo-router";
import socket from "../../utils/socket";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { appColors } from "../../constants/appColor";
import axiosInstance from "../../utils/axiosInstance";

const ChatScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const [conversationId, setConversationId] = useState(
    params.conversationId || null
  );
  const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
  const [messages, setMessages] = useState([]);
  // const [otherUser, setOtherUser] = useState(null);

  // useEffect(() => {
  //   if (params.otherUser) {
  //     try {
  //       const parsed = JSON.parse(params.otherUser);
  //       setOtherUser(parsed);
  //     } catch (e) {
  //       console.error("Invalid JSON for otherUser", e);
  //     }
  //   }
  // }, [params.otherUser]);

  useEffect(() => {
    
    if (socket && otherUser?._id && user?._id) {
      console.log(otherUser._id);
      socket.emit("join_conversation", {
        senderId: user._id,
        rereceiveId: otherUser._id,
      });

      socket.emit("joinUserRoom", user._id);

      socket.on("joined_room", (data) => {
        setConversationId(data.conversationId);
      });

      // Lắng nghe khi conversation mới được tạo
      socket.on(
        "conversation_created",
        ({ conversationId: newConversationId }) => {
          setConversationId(newConversationId);
        }
      );

      return () => {
        socket.off("joined_room");
        socket.off("conversation_created");
      };
    }
  }, [otherUser, conversationId]);

  // Trong ChatScreen.js
  const handleSendMessage = async (messageContent) => {
    if (user?._id && socket) {
      
      if (messageContent.type === "text") {
        socket.emit("sendMessage", {
          conversationId,
          senderId: user._id,
          rereceiveId: otherUser._id,
          content: messageContent.message,
          messageType: "text",
        });
      } else {
        try {
          const response = await axiosInstance.post(
            "/api/message/uploadNhieuFile",
            messageContent.image, // Đây là FormData đã được tạo
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
              content: response.data.data, // URL ảnh từ server
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

  // Thêm effect để cuộn xuống cuối khi messages thay đổi
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      // Sử dụng requestAnimationFrame để đảm bảo scroll sau khi render
      requestAnimationFrame(() => {
        scrollViewRef.current.scrollToEnd({ animated: false });
      });
    }
  }, [messages]);

  // Effect để scroll đến cuối khi vào trang
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && messages.length > 0) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 50); // Thêm delay nhỏ để đảm bảo layout đã ổn định

    return () => clearTimeout(timer);
  }, []);

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
        <InputSend onSend={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

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
