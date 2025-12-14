import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import socketReducer from "./slices/socketSclice";
import chatReducer from "./slices/chatList"
import editReducer from "./slices/messages/editMessage"
import replyReducer from "./slices/messages/replyMessage"
import messagesReducer from "./slices/messages/messages"
import notificationReducer from "./slices/notification/notificationSlice"
import mutedUsers from "./slices/blockedUsers/muteUserSlice"
import blockedUsers from "./slices/blockedUsers/blockedSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    user: userReducer,
    socket: socketReducer,
    chat: chatReducer,
    editMessage: editReducer,
    replyMessage: replyReducer,
    messages: messagesReducer,
    notification: notificationReducer,
    muteUser: mutedUsers,
    blockedUser: blockedUsers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "socket/setSocket", 
        ],
        ignoredPaths: [
          "socket.socket", 
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
