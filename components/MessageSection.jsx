import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import { useLocalSearchParams } from 'expo-router';
import socket from '../utils/socket';

const MessageSection = ({conversationId, messages, setMessages}) => {

  const params = useLocalSearchParams();
    // const conversationId = params.conversationId;
    // const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
    const [loading, setLoading] = useState(true);

  const {user} = useSelector((state) => state.auth)
  // const [messages, setMessages] = useState([])

  const currentUserId = user._id

  

  useEffect(() => {
    const fetchMessageConversation = async () => {
      try {
        const response = await axiosInstance.get(`/api/message/${conversationId}`);
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    if (conversationId) {
      fetchMessageConversation();
    }
  }, [conversationId]);


  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        // Kiểm tra xem đã có tin nhắn này chưa (dựa vào _id)
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (!exists) return [...prev, newMessage];
          return prev;
        });
      }
    };
  
    socket.on('message_sent', handleNewMessage);
    socket.on('receive_message', handleNewMessage);
  
    return () => {
      socket.off('message_sent', handleNewMessage);
      socket.off('receive_message', handleNewMessage);
    };
  }, [conversationId]);
  
  
  return (
    <View style={styles.container}>
      {messages.map((message) => {
        const isSentByMe = message.senderId._id === currentUserId;
        
        return (
          <View
            key={message._id}
            style={[
              styles.messageContainer,
              isSentByMe ? styles.sentMessage : styles.receivedMessage
            ]}
          >
            {!isSentByMe && (
              <View style={styles.avatarContainer}>
                {message.senderId.avatarURL ? (
                  <Image 
                    source={{ uri: message.senderId.avatarURL }} 
                    style={styles.avatar}
                    onError={() => console.log("Error loading avatar for:", message.senderId.username)}
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
                isSentByMe ? styles.sentBubble : styles.receivedBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                isSentByMe && styles.sentMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.timestamp,
                isSentByMe && styles.sentTimestamp
              ]}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 12,
  },
  sentBubble: {
    backgroundColor: '#0084ff',
    borderBottomRightRadius: 0,
  },
  receivedBubble: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  sentMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  sentTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
});

export default MessageSection;