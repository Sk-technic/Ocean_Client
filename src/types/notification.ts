export interface IActorSnapshot {
    _id: string;
    username: string | null;
    profilePic: string | null;
}

export interface INotificationPayload {
    _id: string;
    type: "follow" | "follow-request" | "request-accepted" | "like" | "comment" | "mention";
    message: string;
    postId?: string | null;
    isRead: boolean;
    createdAt: string;
    actor: IActorSnapshot; // ⭐ NEW
}

export interface INotificationState {
    notifications: INotificationPayload[];
    unreadCount: number;
}
