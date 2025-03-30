import {
  AlertIOS,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

// Hàm chuyển ảnh từ URI sang Base64 (chỉ khi cần)
const getBase64FromUri = async (uri) => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result.split(',')[1]); // Chỉ lấy phần base64
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error("Lỗi khi chuyển ảnh từ URI sang Base64"));
      };
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    } catch (error) {
      reject(error);
    }
  });
};

const commonFuc = {
  notifyMessage: message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(message);
    }
  }
};

const handleSendImage = async (file, uploadFile, isCoverImage) => {
  if (!file || !file.uri) {
    console.error("Lỗi: file không hợp lệ", file);
    return;
  }

  let fileName = file.fileName || `image_${Date.now()}`;
  let fileExtension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
  fileExtension = `.${fileExtension}`;

  let fileBase64 = file.base64;
  
  // Nếu không có base64, convert từ URI
  if (!fileBase64) {
    try {
      console.log("Không có base64, đang chuyển đổi từ URI...");
      fileBase64 = await getBase64FromUri(file.uri);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi ảnh sang Base64:", error);
      return;
    }
  }

  const body = { fileName, fileExtension, fileBase64 };

  try {
    await uploadFile(body, isCoverImage);
    console.log("Upload file thành công:", body);
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
  }
};

export const showImagePicker = async (uploadFile, isCoverImage) => {
  const options = {
    mediaType: 'photo',
    includeBase64: true,  // Quan trọng: đảm bảo trả về Base64
  };

  launchImageLibrary(options, async res => {
    if (res.didCancel) {
      commonFuc.notifyMessage('Hủy chọn ảnh');
    } else if (res.errorCode) {
      console.error("Lỗi chọn ảnh:", res.errorMessage);
      commonFuc.notifyMessage('Lỗi chọn ảnh');
    } else {
      let source = res.assets?.[0];
      if (source) {
        await handleSendImage(source, uploadFile, isCoverImage);
      } else {
        console.error("Lỗi: Không tìm thấy ảnh trong assets");
      }
    }
  });
};

export const openCamera = async (uploadFile, isCoverImage) => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Quyền truy cập camera',
          message: 'Ứng dụng cần quyền để chụp ảnh',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'Đồng ý',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        commonFuc.notifyMessage('Chưa cấp quyền truy cập máy ảnh');
        return;
      }
    }
  } catch (err) {
    console.error("Lỗi khi xin quyền:", err);
    return;
  }

  const options = {
    mediaType: 'photo',
    includeBase64: true,  // Quan trọng: đảm bảo có Base64
  };

  launchCamera(options, async res => {
    if (res.didCancel) {
      commonFuc.notifyMessage('Hủy chụp ảnh');
    } else if (res.errorCode) {
      console.error("Lỗi chụp ảnh:", res.errorMessage);
      commonFuc.notifyMessage('Lỗi chụp ảnh');
    } else {
      let source = res.assets?.[0];
      if (source) {
        await handleSendImage(source, uploadFile, isCoverImage);
      } else {
        console.error("Lỗi: Không tìm thấy ảnh trong assets");
      }
    }
  });
};

export default commonFuc;
