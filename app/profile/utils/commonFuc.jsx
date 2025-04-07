import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

const commonFuc = {
  notifyMessage: (title, message) => {
    Alert.alert(title || 'Thông báo', message);
  }
};

const handleSendImage = async (file, uploadFile, isCoverImage) => {
  if (!file || !file.uri) {
    console.error("Lỗi: file không hợp lệ", file);
    return;
  }

  let fileName = file.fileName || `image_${Date.now()}`;
  let fileExtension = fileName.split('.').pop() || 'jpg';
  fileExtension = fileExtension.toLowerCase();

  // Expo đã trả về base64 nếu yêu cầu
  const fileBase64 = file.base64 || '';

  const body = { 
    fileName, 
    fileExtension: `.${fileExtension}`, 
    fileBase64 
  };

  try {
    await uploadFile(body, isCoverImage);
    commonFuc.notifyMessage('Thành công', 'Upload file thành công');
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
    commonFuc.notifyMessage('Lỗi', 'Upload file thất bại');
  }
};

export const showImagePicker = async (uploadFile, isCoverImage) => {
  // Yêu cầu quyền truy cập thư viện ảnh
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    commonFuc.notifyMessage('Cần cấp quyền', 'Ứng dụng cần quyền truy cập thư viện ảnh');
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled) {
    await handleSendImage(result.assets[0], uploadFile, isCoverImage);
    console.log("Da upload file", result.assets[0]);
  } else {
    commonFuc.notifyMessage('Thông báo', 'Bạn đã hủy chọn ảnh');
  }
};

export const openCamera = async (uploadFile, isCoverImage) => {
  // Yêu cầu quyền truy cập camera
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    commonFuc.notifyMessage('Cần cấp quyền', 'Ứng dụng cần quyền truy cập camera');
    return;
  }

  let result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: true,
  });

  if (!result.canceled) {
    // Yêu cầu quyền lưu ảnh vào thư viện (iOS)
    if (Platform.OS === 'ios') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
      }
    }
    
    await handleSendImage(result.assets[0], uploadFile, isCoverImage);
  } else {
    commonFuc.notifyMessage('Thông báo', 'Bạn đã hủy chụp ảnh');
  }
};

export default commonFuc;