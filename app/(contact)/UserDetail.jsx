import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { appColors } from '../../constants/appColor';

const UserDetail = () => {
  // Dummy data - thay thế bằng dữ liệu thực tế
  const user = {
    name: 'Mạch Xuân',
    phone: '0123456789',
    avatar: 'https://example.com/avatar.jpg',
    gender: 'Nam',
    birthday: '01/01/2000',
    isFriend: true,
  };

  const handleMessage = () => {
    // Xử lý nhắn tin
  };

  const handleCall = () => {
    // Xử lý gọi điện
  };

  const handleVideoCall = () => {
    // Xử lý video call
  };

  const handleAddContact = () => {
    // Xử lý thêm vào danh bạ
  };

  const handleBlock = () => {
    // Xử lý chặn
  };

  const handleDelete = () => {
    // Xử lý xóa
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {/* <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar}
            defaultSource={require('../../assets/default-avatar.png')}
          /> */}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
            <MaterialIcons name="chat" size={24} color={appColors.primary} />
            <Text style={styles.actionText}>Nhắn tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <MaterialIcons name="call" size={24} color={appColors.primary} />
            <Text style={styles.actionText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleVideoCall}>
            <MaterialIcons name="videocam" size={24} color={appColors.primary} />
            <Text style={styles.actionText}>Video call</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={24} color={appColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="cake" size={24} color={appColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>{user.birthday}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome5 name="user" size={24} color={appColors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>{user.gender}</Text>
            </View>
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem} onPress={handleAddContact}>
            <MaterialIcons name="person-add" size={24} color={appColors.primary} />
            <Text style={styles.optionText}>Thêm vào danh bạ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={handleBlock}>
            <MaterialIcons name="block" size={24} color="red" />
            <Text style={[styles.optionText, { color: 'red' }]}>Chặn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
            <MaterialIcons name="delete" size={24} color="red" />
            <Text style={[styles.optionText, { color: 'red' }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: appColors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    color: appColors.primary,
  },
  infoSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    marginTop: 4,
  },
  optionsSection: {
    paddingVertical: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
  },
});

export default UserDetail;
