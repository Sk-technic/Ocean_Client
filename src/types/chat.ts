// types/message.ts
export interface IMedia {
  _id:string;
  url?: string;
  type?: "image" | "video" | "audio" | "file" | "media";
  thumbnail?: string;
  size?: number;
  duration?: number;
  width?:number;
  height?:number
}
interface ReplyTo{
  messageId:string;
  content?:string;
  sender:{
    _id:string;
    fullName:string;
  },
  media?:IMedia[] | null;
}
export interface Message {
  _id: string;
  roomId: string;
  sender: {
    _id: string;
    username: string;
    fullName: string;
    profilePic?: string;
  };
  staus?:"pending"|"send"|"seen";
  content?: string;
  media?: IMedia[] | null;
  type: "text" | "image" | "video" | "audio" | "file";
  replyTo: ReplyTo | string;
  reactions?: Record<string, string[]>; // e.g. { "❤️": ["user1", "user2"] }
  readBy?: string[];
  deliveredTo?: string[];
  isEdited?: boolean;
  lastMessage?:string;
  isDeleted?: boolean;
  createdAt: string;
  status?: string;
  seenBy:{user:string,time:Date}[];
}


// export interface ChatParticipant {
//   _id: string;
//   username: string;
//   fullName: string;
//   profilePic: string;
//   email: string;
//   isOnline?: boolean;      
//   lastActive?: Date;     
// }


export interface LastMessageMeta {
  _id: string;
  sender: string; // userId
  text: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  name?: string;
  description?: string;
  avatar?: string;
  membersHash?:string;
  type: "dm"|"group";
  groupAdmin?: string[];
  lastMessageMeta?: LastMessageMeta;
  participants: IParticipant[];
  status:string;
  createdBy?:string;
  blockedMe?:boolean;
}


export interface IParticipant {
  _id: string;
  user?:string;
  username: string;
  fullName: string;
  email?: string;
  profilePic?: string;
  isOnline: boolean;
  lastActive?: number | Date;
  unreadCount?: number;
  isMuted?: boolean;
  isArchived?: boolean;
  roomId?:string;
  isBlocked?:boolean;
  blockedME?:boolean;
}

// types.ts


export interface ILastMessageMeta {
  text?: string;
  sender?: string;
  createdAt?: string;
}

export interface IUserRoom {
  _id: string;
  participants: IParticipant[];
  lastMessageMeta?: ILastMessageMeta;
  isGroup?: boolean;
  // unreadCount?: Record<string, any>;
}
