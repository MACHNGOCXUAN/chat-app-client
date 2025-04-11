import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';
import axiosInstance from '../../../utils/axiosInstance';

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

export const updateAvatar = async (email, urlUpdateName) => {
  try {
    // 1. Cách đơn giản nhất - sử dụng string trực tiếp
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // Thay bằng string đơn giản
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    const nameImage = urlUpdateName == "updateAvatar" ? "avatarURL" : "coverImage"
    

    // 2. Hoặc nếu muốn dùng enum (kiểm tra import trước)
    // let result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [4, 3],
    //   quality: 1,
    // });

    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      
      // Xử lý tên file và type linh hoạt hơn
      const fileName = uri.split('/').pop() || 'avatar.jpg';
      const fileType = uri.split('.').pop() || 'jpg';
      const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;

      const formData = new FormData();
      formData.append(nameImage, {
        uri: uri,
        name: fileName,
        type: mimeType,
      });
      formData.append('email', email);

      const response = await axiosInstance.put(`/${urlUpdateName}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        commonFuc.notifyMessage('Thành công', 'Cập nhật ảnh đại diện thành công');
        return response.data;
      }
    }
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// export const showImagePicker = async (email) => {
//   try {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
//     if (status !== 'granted') {
//       commonFuc.notifyMessage('Cần cấp quyền', 'Ứng dụng cần quyền truy cập thư viện ảnh');
//       return;
//     }

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       const selectedImage = result.assets[0];
//       console.log("Ảnh đã chọn:", selectedImage);


//       const formData = new FormData();
//       formData.append('avatarURL', {
//         uri: selectedImage.uri,
//         name: 'avatar.jpg',
//         type: 'image/jpeg'
//       });
//       formData.append('email', email);

//       // Gọi API upload avatar
//       const response = await axiosInstance.post(`/${urlUpdateName}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data.success) {
//         commonFuc.notifyMessage('Thành công', 'Cập nhật ảnh đại diện thành công');
//         return response.data;
//       }
//     } else {
//       commonFuc.notifyMessage('Thông báo', 'Bạn đã hủy chọn ảnh');
//     }
//   } catch (error) {
//     console.error('Lỗi khi upload ảnh:', error);
//     commonFuc.notifyMessage('Lỗi', 'Upload ảnh thất bại: ' + error.message);
//     throw error; // Ném lỗi để xử lý tiếp nếu cần
//   }
// };

export const openCamera = async (uploadFile, isCoverImage, email, urlUpdateName) => {
  try {
    // Yêu cầu quyền truy cập camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      commonFuc.notifyMessage('Cần cấp quyền', 'Ứng dụng cần quyền truy cập camera');
      return;
    }

    const nameImage = urlUpdateName == "updateAvatar" ? "avatarURL" : "coverImage"

    

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      if (Platform.OS === 'ios') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
        }
      }
      const formData = new FormData();
      formData.append(nameImage, {
        uri: result.assets[0].uri,
        name: 'avatar.jpg',
        type: 'image/jpeg'
      });
      formData.append('email', email);

      const response = await axiosInstance.put(`/${urlUpdateName}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        commonFuc.notifyMessage('Thành công', 'Cập nhật ảnh đại diện thành công');
      }
    } else {
      commonFuc.notifyMessage('Thông báo', 'Bạn đã hủy chụp ảnh');
    }
  } catch (error) {
    console.error('Lỗi khi upload ảnh:', error);
    commonFuc.notifyMessage('Lỗi', 'Upload ảnh thất bại');
  }
};

export default commonFuc;