export interface INotificationPayload {
  _id: string;
  type: string;
  text: string;
  isRead?: boolean;
  postId: string | null;
  createdAt: string;
  fromUser: {
    _id: string;
    username: string;
    fullName: string;
    profilePic: string | null;
  };
}

export interface INotificationState {
  _id: string;
  user: string;
  notifications: INotificationPayload[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
