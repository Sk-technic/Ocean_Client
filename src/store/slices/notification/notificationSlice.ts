import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { INotificationPayload, INotificationState } from "../../../types/notification";

interface INotificationRootState {
    notifications: INotificationPayload[];
    isLoading: boolean;
    unreadCount: number;
}

const initialState: INotificationRootState = {
    notifications: [],
    isLoading: true,
    unreadCount: 0,
};

const NotificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        // Called when page loads (fetch all notifications)
        setNotifications: (state, action: PayloadAction<INotificationState>) => {
            state.notifications = action.payload.notifications;
            state.unreadCount = action.payload.unreadCount;
            state.isLoading = false;
        },

        // Called when notification type changes (e.g. follow-request → request-accepted)
        updateNotification: (
            state,
            action: PayloadAction<{ id: string; type: INotificationPayload["type"] }>
        ) => {
            const index = state.notifications.findIndex(
                (n) => n._id === action.payload.id
            );

            if (index !== -1) {
                state.notifications[index].type = action.payload.type;
                state.notifications = [...state.notifications]; // force UI re-render
            }
        },

        // Called when NEW notification arrives from socket
        addNotification: (
            state,
            action: PayloadAction<{ singleNotification: INotificationPayload }>
        ) => {
            state.notifications.unshift(action.payload.singleNotification);

            if (!action.payload.singleNotification.isRead) {
                state.unreadCount++;
            }
        },

        // Mark one notification as read
        markAsRead: (state, action: PayloadAction<{ id: string }>) => {
            const noti = state.notifications.find(
                (n) => n._id === action.payload.id
            );

            if (noti && !noti.isRead) {
                noti.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },

        // Mark all as read
        markAllAsRead: (state) => {
            state.notifications.forEach((n) => (n.isRead = true));
            state.unreadCount = 0;
        },

        removeNotification: (
            state,
            action: PayloadAction<{ notificationId: string }>
        ) => {
            state.notifications = state.notifications.filter(
                (n) => n._id !== action.payload.notificationId
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
    updateNotification,
} = NotificationSlice.actions;

export default NotificationSlice.reducer;
