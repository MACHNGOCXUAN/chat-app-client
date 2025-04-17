import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// export const featchFriend = createAsyncThunk(
//   ""
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