import React, { useState, useRef, useEffect } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import { removeAuth, updateUser } from '../../stores/reducers/authReducer';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';

const DEFAULT_IMAGE_MODAL = {
  isVisible: false,
  userName: '',
  content: [],
  isImage: true,
};

const DEFAULT_COVER_IMAGE = 'https://i.ibb.co/1GtXD3pd/favicon1.png';


function parseDateOfBirth(dateString) {
  if (!dateString) return { day: 1, month: 1, year: 2000 };

  let parts;

  if (dateString.includes('/')) {
    parts = dateString.split('/');
  }
  else if (dateString.includes('-')) {
    parts = dateString.split('-');
  }
  else {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        };
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    return { day: 1, month: 1, year: 2000 };
  }

  if (parts.length !== 3) return { day: 1, month: 1, year: 2000 };

  let year, month, day;

  if (parts[0].length === 4) {
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
    day = parseInt(parts[2]);
  }
  else {
    day = parseInt(parts[0]);
    month = parseInt(parts[1]);
    year = parseInt(parts[2]);
  }

  return { year, month, day };
}

export default function MeScreen() {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userProfile, setUserProfile] = useState({
    avatar: user?.avatarURL || null,
    coverImage: user?.coverImage || DEFAULT_COVER_IMAGE,
    name: user?.username || '',
    gender: user?.gender || false,
    dateOfBirth: user?.dateOfBirth ? parseDateOfBirth(user?.dateOfBirth) : '',
    username: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [isUpdateProfile, setIsUpdateProfile] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isLogoutAll, setIsLogoutAll] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const isCoverImageRef = useRef(false);
  const [imageProps, setImageProps] = useState(DEFAULT_IMAGE_MODAL);

  useEffect(() => {
    if (user) {
      setUserProfile({
        avatar: user.avatarURL || null,
        coverImage: user.coverImage || DEFAULT_COVER_IMAGE,
        name: user.username || '',
        gender: user.gender || false,
        dateOfBirth: user.dateOfBirth ? parseDateOfBirth(user.dateOfBirth) : '',
        username: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleLogOut = () => {
    Alert.alert('Cảnh báo', 'Bạn có muốn đăng xuất không?', [
      {
        text: 'Không',
        style: 'cancel'
      },
      {
        text: 'Có',
        onPress: async () => {
          try {
            setLoading(true);

            dispatch(removeAuth());
            await AsyncStorage.removeItem("auth");

            router.replace('/(screens)/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại sau.');
          } finally {
            setLoading(false);
          }
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
    // setIsLogoutAll(true);
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
    if (userProfile?.dateOfBirth && typeof userProfile.dateOfBirth === 'string') {
      const parts = userProfile.dateOfBirth.split('/');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parseInt(parts[2]) + 1;
        return `${day}/${month}/${year}`;
      }
    }
    else if (userProfile?.dateOfBirth && typeof userProfile.dateOfBirth === 'object') {
      const day = ('00' + (userProfile.dateOfBirth.day + 1)).slice(-2);
      const month = ('00' + userProfile.dateOfBirth.month).slice(-2);
      const year = userProfile.dateOfBirth.year;
      return `${day}/${month}/${year}`;
    }
    return userProfile?.dateOfBirth || '';
  };

  const handleEmail = () => {
    return userProfile?.username || '';
  };

  const handlePhoneNumber = () => {
    return userProfile?.phoneNumber || '';
  };

  const onImagePress = isCoverImage => {
    isCoverImageRef.current = isCoverImage;
    setIsImageVisible(true);
  };

  // const onUploadFile = (data) => {
  //   if (data?.success) {
  //     // Cập nhật local state (nếu cần)
  //     setUserProfile(prev => ({
  //       ...prev,
  //       avatar: data.avatarURL || prev.avatar,
  //       coverImage: data.coverImage || prev.coverImage,
  //     }));

  //     // Cập nhật Redux store
  //     dispatch(updateUser({
  //       avatarURL: data.avatarURL, // Cập nhật avatar
  //       coverImage: data.coverImage, // Cập nhật cover (nếu có)
  //     }));
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <Spinner visible={loading} textContent="Đang tải..." />
      <ScrollView>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: '#fff' }}>
              <View style={styles.header}>
                <Image
                  source={{ uri: userProfile?.coverImage || DEFAULT_COVER_IMAGE }}
                  style={styles.coverImage}
                  onPress={() => onImagePress(true)}
                />
                <Avatar
                  title={userProfile?.name ? userProfile.name.charAt(0) : ''}
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
                  {userProfile?.gender === 'male' ? 'Nam' : userProfile?.gender === 'female' ? 'Nữ' : 'Khác'}
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
                iconName="edit"
                title="Đổi thông tin"
              />
              <OptionButton
                onPress={() => setIsChangePasswordVisible(true)}
                iconType="antdesign"
                iconName="lock"
                title="Đổi mật khẩu"
              />
              {/* <OptionButton
                onPress={() => setIsLogoutAll(true)}
                iconType="material"
                iconName="logout"
                title="Đăng xuất ra khỏi các thiết bị khác"
              /> */}
              <OptionButton
                onPress={handleLogOut}
                iconType="material"
                iconName="logout"
                title="Đăng xuất"
                iconColor="red"
                titleStyle={{ color: 'red' }}
              />
            </Pressable>
          </>
        )}
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
    // backgroundColor: '#E2E9F1',
    backgroundColor: "#fff",
    flex: 1
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
