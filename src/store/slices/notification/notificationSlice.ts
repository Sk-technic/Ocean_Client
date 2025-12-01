import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { INotificationPayload, INotificationState } from "../../../types/notification";


interface INotification {
    notifications: INotificationPayload[];
    isLoading: boolean;
    unreadCount: number;
}
const initialState: INotification = {
    notifications: [],
    isLoading: true,
    unreadCount: 0,
};

const NotificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<INotificationState>) => {
            state.notifications = action.payload.notifications;
            state.unreadCount = action.payload.unreadCount;
            state.isLoading = false;
        },

        updateNotification: (state, action) => {
            const index = state.notifications.findIndex(
                n => n._id === action.payload.id.toString()
            );
            console.log(JSON.parse(JSON.stringify(index)));

            if (index !== -1) {
                state.notifications[index] = {
                    ...state.notifications[index],
                    type: action.payload.type
                };

                // Force UI update
                state.notifications = [...state.notifications];
            }
        },

        addNotification: (state, action: PayloadAction<{ singleNotification: INotificationPayload }>) => {
            state.notifications.unshift(action.payload.singleNotification);
            if (!action.payload.singleNotification?.isRead) {
                state.unreadCount++;
            }
        },

        markAsRead: (state, action: PayloadAction<{ createdAt: string }>) => {
            const noti = state.notifications.find(
                (n) => n.createdAt === action.payload.createdAt
            );
            if (noti && !noti.isRead) {
                noti.isRead = true;
                state.unreadCount--;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach((n) => (n.isRead = true));
            state.unreadCount = 0;
        },
        removeNotification: (
            state,
            action: PayloadAction<{ createdAt: string }>
        ) => {
            state.notifications = state.notifications.filter(
                (noti) => noti.createdAt !== action.payload.createdAt
            );
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const {
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    updateNotification
} = NotificationSlice.actions;

export default NotificationSlice.reducer;
