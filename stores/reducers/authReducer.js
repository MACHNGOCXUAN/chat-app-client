import { createSlice } from '@reduxjs/toolkit'

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
    }
  }
})

export const { addAuth, removeAuth } = autSlide.actions
export default autSlide.reducer