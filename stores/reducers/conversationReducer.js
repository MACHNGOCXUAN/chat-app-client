import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchConversation = createAsyncThunk(
  "conversation/fetchConversation",
  async (conversationId) => {
    const response = await axiosInstance.get(`/api/conversation/conversationbyid/${conversationId}`);
    return response.data.data;
  }
)


const conversationSlide = createSlice({
  name: "conversation",
  initialState: {
    conversation: null,
  },
  reducers: {
    updateConversationSetting: (state, action) => {
      const { conversationId, setting, permission } = action.payload;
      const conv = state.list.find(c => c._id === conversationId);
      if (conv) {
        conv.settings[setting] = permission;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConversation.fulfilled, (state, action) => {
      state.conversation = action.payload;
    });
  },
})

export const { updateConversationSetting  } = conversationSlide.actions
export default conversationSlide.reducer