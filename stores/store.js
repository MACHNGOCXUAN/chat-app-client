import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducers/authReducer"
import conversationReducer from "./reducers/conversationReducer"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation: conversationReducer
  }
})