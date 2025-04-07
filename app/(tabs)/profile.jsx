import React, { useState, useRef } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Avatar, Image, ListItem } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import OptionButton from '../profile/modal/OptionButton';
import AvatarModal from '../profile/modal/AvatarModal';
import ChangePasswordModal from '../profile/modal/ChangePasswordModal';
import LogoutAllModal from '../profile/modal//LogoutAllModal';
import UpdateUserProfileModal from '../profile/modal/UpdateUserProfileModal';
import ViewImageModal from '../profile/modal/ViewImageModal';
import { useSelector } from 'react-redux';

const DEFAULT_IMAGE_MODAL = {
  isVisible: false,
  userName: '',
  content: [],
  isImage: true,
};

const test = 'https://i.ibb.co/1GtXD3pd/favicon1.png';

export default function MeScreen() {

  const { user } = useSelector(state => state.auth)
  console.log("user: ", user);
  

  const [userProfile, setUserProfile] = useState({
    avatar: user?.avatarURL,
    coverImage: 'https://i.ibb.co/1GtXD3pd/favicon1.png',
    name: user?.username,
    gender: false,
    dateOfBirth: { day: 24, month: 9, year: 2003},
    username: 'vuongcong276@gmail.com',
  });

  const [isUpdateProfile, setIsUpdateProfile] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isLogoutAll, setIsLogoutAll] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const isCoverImageRef = useRef(false);
  const [imageProps, setImageProps] = useState(DEFAULT_IMAGE_MODAL);

  const handleLogOut = () => {
    Alert.alert('Cảnh báo', 'Bạn có muốn đăng xuất không?', [
      {
        text: 'Không',
      },
      {
        text: 'Có',
        onPress: async () => {
          // Giả lập hành động đăng xuất
          console.log('Đã đăng xuất');
        },
      },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.prompt(
      'Đăng xuất ra khỏi các thiết bị khác',
      'Nhập mật khẩu hiện tại của bạn để đăng xuất ra khỏi các thiết bị khác',
      [
        {
          text: 'Không',
        },
        {
          text: 'Có',
          onPress: async password => {
            console.log('Đã đăng xuất khỏi tất cả thiết bị');
          },
        },
      ],
      'secure-text',
    );
  };

  const handleViewImage = isCoverImage => {
    let url = null;
    if (isCoverImage) {
      url = userProfile?.coverImage;
    } else {
      url = userProfile?.avatar;
    }

    if (!isCoverImage && !url) {
      console.log('Bạn chưa có ảnh đại diện');
      return;
    }

    setImageProps({
      isVisible: true,
      userName: userProfile?.name,
      content: [{ url: url || DEFAULT_COVER_IMAGE }],
      isImage: true,
    });
  };

  const handleDoB = () => {
    let dob = '';
    if (userProfile?.dateOfBirth) {
      const day = ('00' + userProfile?.dateOfBirth.day).slice(-2);
      const month = ('00' + userProfile?.dateOfBirth.month).slice(-2);
      const year = userProfile?.dateOfBirth.year;
      dob = `${day}/${month}/${year}`;
    }
    return dob;
  };

  const handleEmail = () => {
    const username = userProfile?.username;
    let email = '';
    if (username) {
      if (username.includes('@')) {
        email = username;
      }
    }
    return email;
  };

  const handlePhoneNumber = () => {
    const username = userProfile?.username;
    let phoneNumber = '';
    if (username) {
      if (!username.includes('@')) {
        phoneNumber = username;
      }
    }
    return phoneNumber;
  };

  const onImagePress = isCoverImage => {
    isCoverImageRef.current = isCoverImage;
    setIsImageVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={false} textContent="Đang tải..." />
      <ScrollView>
        <View style={{ backgroundColor: '#fff' }}>
          <View style={styles.header}>
            <Image
              source={{ uri: userProfile?.coverImage || DEFAULT_COVER_IMAGE }}
              style={styles.coverImage}
              onPress={() => onImagePress(true)}
            />
            <Avatar
              title={userProfile?.name.charAt(0)}
              source={userProfile?.avatar ? { uri: userProfile?.avatar } : null}
              size={120}
              rounded
              overlayContainerStyle={{
                backgroundColor: '#D3D3D3',
              }}
              containerStyle={styles.avatar}
              onPress={() => onImagePress(false)}
            />
          </View>
          <View style={styles.action}>
            <Text style={styles.name}>{userProfile?.name}</Text>
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider}></View>
          </View>
          <ListItem>
            <Text style={styles.title}>Giới tính</Text>
            <Text style={styles.content}>
              {userProfile?.gender ? 'Nữ' : 'Nam'}
            </Text>
          </ListItem>
          <View style={styles.dividerContainer}>
            <View style={styles.divider}></View>
          </View>
          <ListItem>
            <Text style={styles.title}>Ngày sinh</Text>
            <Text style={styles.content}>{handleDoB()}</Text>
          </ListItem>
          {handleEmail().length > 0 && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.divider}></View>
              </View>
              <ListItem>
                <Text style={styles.title}>Email</Text>
                <Text style={styles.content}>{handleEmail()}</Text>
              </ListItem>
            </>
          )}
          {handlePhoneNumber().length > 0 && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.divider}></View>
              </View>
              <ListItem>
                <Text style={styles.title}>Điện thoại</Text>
                <Text style={styles.content}>{handlePhoneNumber()}</Text>
              </ListItem>
              <ListItem containerStyle={{ paddingTop: 0 }}>
                <Text style={styles.title}></Text>
                <Text style={styles.content}>
                  Số điện thoại của bạn chỉ hiển thị với bạn bè có lưu số của
                  bạn trong danh bạ
                </Text>
              </ListItem>
            </>
          )}
        </View>

        <ViewImageModal imageProps={imageProps} setImageProps={setImageProps} />

        <Pressable style={styles.viewEle}>
          <OptionButton
            onPress={() => setIsUpdateProfile(true)}
            iconType="antdesign"
            iconName="edit"setIsChangePasswordVisible
            title="Đổi thông tin"
          />
          <OptionButton
            onPress={() => setIsChangePasswordVisible(true)}
            iconType="antdesign"
            iconName="lock"
            title="Đổi mật khẩu"
          />
          <OptionButton
            onPress={() => setIsLogoutAll(true)}
            iconType="material"
            iconName="logout"
            title="Đăng xuất ra khỏi các thiết bị khác"
          />
          <OptionButton
            onPress={handleLogOut}
            iconType="material"
            iconName="logout"
            title="Đăng xuất"
            iconColor="red"
            titleStyle={{ color: 'red' }}
          />
        </Pressable>
      </ScrollView>

      {isUpdateProfile && (
        <UpdateUserProfileModal
          modalVisible={isUpdateProfile}
          setModalVisible={setIsUpdateProfile}
          userProfile={userProfile}
        />
      )}

      {isChangePasswordVisible && (
        <ChangePasswordModal
          modalVisible={isChangePasswordVisible}
          setModalVisible={setIsChangePasswordVisible}
        />
      )}
      {isLogoutAll && (
        <LogoutAllModal
          modalVisible={isLogoutAll}
          setModalVisible={setIsLogoutAll}
        />
      )}
      {isImageVisible && (
        <AvatarModal
          modalVisible={isImageVisible}
          setModalVisible={setIsImageVisible}
          isCoverImage={isCoverImageRef.current}
          onViewImage={handleViewImage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E2E9F1',
  },
  header: {},
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  detailsContainer: { width: '100%' },
  title: {
    width: '20%',
  },
  content: {
    color: 'grey',
    width: '80%',
    paddingRight: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  avatar: {
    marginTop: -80,
    transform: [{ translateX: 100 }],
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
  },
  dividerContainer: {
    backgroundColor: '#fff',
    height: 2,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E6E8',
    marginHorizontal: 15,
  },
});
