import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { openCamera, updateAvatar } from '../../app/profile/utils/commonFuc'


// export const updateAvatar = createAsyncThunk(
//   "user/updateAvatar",
//   async (email, urlUpdateName) => {
//     try {
//       // 1. Cách đơn giản nhất - sử dụng string trực tiếp
//       let result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: 'images', // Thay bằng string đơn giản
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.7, // Reduced from 1 to 0.7 to keep file size smaller
//       });
  
//       const nameImage = urlUpdateName == "updateAvatar" ? "avatarURL" : "coverImage"
  
//       if (!result.canceled && result.assets && result.assets[0]) {
//         const uri = result.assets[0].uri;
  
//         // Xử lý tên file và type linh hoạt hơn
//         const fileName = uri.split('/').pop() || 'avatar.jpg';
//         const fileType = uri.split('.').pop() || 'jpg';
//         const mimeType = `image/${fileType === 'jpg' ? 'jpeg' : fileType}`;
  
//         const formData = new FormData();
//         formData.append(nameImage, {
//           uri: uri,
//           name: fileName,
//           type: mimeType,
//         });
//         formData.append('email', email);
  
//         const response = await axiosInstance.put(`/${urlUpdateName}`, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
  
//         if (response.data.success) {
//           commonFuc.notifyMessage('Thành công', 'Cập nhật ảnh đại diện thành công');
//           return response.data.user;
//         }
//       }
//     } catch (error) {
//       console.error('Error uploading avatar:', error);
//       throw error;
//     }
//   }
// )

const autSlide = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null
  },
  reducers: {
    addAuth: (state, action) => {
      state.user = action.payload.user,
      state.accessToken = action.payload.accessToken
    },
    removeAuth: (state, action) => {
      state.user = null,
      state.accessToken = null
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = action.payload
      }
    },
  },
  extraReducers: (builer) => {
    builer.addCase(updateAvatar.fulfilled, (state, action) => {
      state.user = action.payload
    })
    builer.addCase(openCamera.fulfilled, (state, action) => {
      state.user = action.payload
    })
  }
})

export const { addAuth, removeAuth, updateUser  } = autSlide.actions
export default autSlide.reducer