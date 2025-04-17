import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const data = [
  {
      "_id": "67ff00a40bf9449e80c6c72a",
      "conversationId": "67fe91d5bd1978d2ec096a0e",
      "senderId": {
          "_id": "67f9af04c8c9359e9b857742",
          "username": "Mạch ngoc xuân",
          "avatarURL": "https://cong-nghe-moi.s3.ap-southeast-1.amazonaws.com/zhxv-1744424605742-Screenshot%202025-03-01%20120757.png"
      },
      "messageType": "text",
      "content": "Tin nhắn đã được thu hồi",
      "edited": true,
      "is_last_message": true,
      "timestamp": "2025-04-16T00:58:12.559Z",
      "createdAt": "2025-04-16T00:58:12.561Z",
      "updatedAt": "2025-04-16T06:31:16.964Z",
      "__v": 0
  },
  {
      "_id": "67ff0143fc18dc111551a040",
      "conversationId": "67fe91d5bd1978d2ec096a0e",
      "senderId": {
          "_id": "67f9af04c8c9359e9b857742",
          "username": "Mạch ngoc xuân",
          "avatarURL": "https://cong-nghe-moi.s3.ap-southeast-1.amazonaws.com/zhxv-1744424605742-Screenshot%202025-03-01%20120757.png"
      },
      "messageType": "text",
      "content": "Xin Chao",
      "edited": false,
      "is_last_message": true,
      "timestamp": "2025-04-16T01:00:51.266Z",
      "createdAt": "2025-04-16T01:00:51.269Z",
      "updatedAt": "2025-04-16T01:00:51.269Z",
      "__v": 0
  },
  {
      "_id": "67ff24fe4ec530e92b81329c",
      "conversationId": "67fe91d5bd1978d2ec096a0e",
      "senderId": {
          "_id": "67f3e4bef883317e9babe079",
          "username": "0976166842",
          "avatarURL": "https://internetviettel.vn/wp-content/uploads/2017/05/H%C3%ACnh-%E1%BA%A3nh-minh-h%E1%BB%8Da.jpg"
      },
      "messageType": "text",
      "content": "hello",
      "edited": false,
      "is_last_message": true,
      "timestamp": "2025-04-16T03:33:18.022Z",
      "createdAt": "2025-04-16T03:33:18.025Z",
      "updatedAt": "2025-04-16T03:33:18.025Z",
      "__v": 0
  },
  {
    "_id": "67ff24fe4ec530e92b81329c",
    "conversationId": "67fe91d5bd1978d2ec096a0e",
    "senderId": {
        "_id": "67f3e4bef883317e9babe079",
        "username": "0976166842",
        "avatarURL": "https://internetviettel.vn/wp-content/uploads/2017/05/H%C3%ACnh-%E1%BA%A3nh-minh-h%E1%BB%8Da.jpg"
    },
    "messageType": "text",
    "content": "hello",
    "edited": false,
    "is_last_message": true,
    "timestamp": "2025-04-16T03:33:18.022Z",
    "createdAt": "2025-04-16T03:33:18.025Z",
    "updatedAt": "2025-04-16T03:33:18.025Z",
    "__v": 0
},
{
  "_id": "67ff00a40bf9449e80c6c729a",
  "conversationId": "67fe91d5bd1978d2ec096a0e",
  "senderId": {
      "_id": "67f9af04c8c9359e9b857742",
      "username": "Mạch ngoc xuân",
      "avatarURL": "https://cong-nghe-moi.s3.ap-southeast-1.amazonaws.com/zhxv-1744424605742-Screenshot%202025-03-01%20120757.png"
  },
  "messageType": "text",
  "content": "Tin nhắn đã được thu hồi",
  "edited": true,
  "is_last_message": true,
  "timestamp": "2025-04-16T00:58:12.559Z",
  "createdAt": "2025-04-16T00:58:12.561Z",
  "updatedAt": "2025-04-16T06:31:16.964Z",
  "__v": 0
},
{
  "_id": "67ff00a40bf9449e80c6c72a",
  "conversationId": "67fe91d5bd1978d2ec096a0e",
  "senderId": {
      "_id": "67f9af04c8c9359e9b857742",
      "username": "Mạch ngoc xuân",
      "avatarURL": "https://cong-nghe-moi.s3.ap-southeast-1.amazonaws.com/zhxv-1744424605742-Screenshot%202025-03-01%20120757.png"
  },
  "messageType": "text",
  "content": "Tin nhắn đã được thu hồi",
  "edited": true,
  "is_last_message": true,
  "timestamp": "2025-04-16T00:58:12.559Z",
  "createdAt": "2025-04-16T00:58:12.561Z",
  "updatedAt": "2025-04-16T06:31:16.964Z",
  "__v": 0
},
  // ... rest of your messages
];

const currentUserId = "67f9af04c8c9359e9b857742";

const MessageSection = () => {
  return (
    <View style={styles.container}>
      {data.map((message) => {
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