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

const ChatScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const conversationId = params.conversationId;
  const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (socket && conversationId && otherUser && user?._id) {
      socket.emit('join_conversation', {
        senderId: user._id,
        rereceiveId: otherUser._id
      });

      socket.emit('joinUserRoom', user._id);
    }
  }, [socket, conversationId, otherUser, user]);

  const handleSendMessage = (messageContent) => {
    if (socket && conversationId && user?._id) {
      socket.emit('sendMessage', {
        conversationId,
        senderId: user._id,
        content: messageContent,
        messageType: 'text'
      });
    }
  };

  const scrollViewRef = useRef();

  return (
    <SafeAreaView className="h-full w-full">
      
      <ScrollView className="p-1 flex-1" 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <MessageSection
          conversationId={conversationId}
          messages={messages}
          setMessages={setMessages}
        />
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
});
