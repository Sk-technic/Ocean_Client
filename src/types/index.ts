// Frontend-only user type (minimal & UI-safe)
export interface User {
    _id: string;
    username: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    profilePic?: string;
    coverImage?: string;
    bio?: string;
    language?: string;
    followersCount?: number;
    followingCount?: number;
    postCount?: number;
    isPrivate:boolean;
    reelsCount?: number;
    videosCount?: number;
    token?: string;
    isVerified: boolean;
    isemailVerified?:boolean;
    status: "active" | "banned" | "suspended";
    createdAt?: string;
    updatedAt?: string;
    subscribersCount?: number;
    socialLinks?: Record<string, string>; 
    followStatus?:string;
}

export interface queryUser {
  _id:string;
    username: string;
    fullName: string;
    firstName:string;
    lastName?:string;
    email?: string | null;
    status: "active" | "banned" | "suspended";
    phone?: string | null;
    profilePic?: string;
    coverImage?: string;
    bio?: string;
    isActive?:'online'|'offline';
    language?: string;
    isPrivate:boolean;
    followersCount?: number;
    followingCount?: number;
    postCount?: number;
    reelsCount?: number;
    videosCount?: number;
    isVerified: boolean;
    isemailVerified?:boolean;
    createdAt?: string;
    updatedAt?: string;
    subscribersCount?: number;
    socialLinks?: Record<string, string>; 
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken:string | null;
    refreshToken:string | null;

}

export interface IsignupData {
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
    profilePic?: string;
    password:string;
}
export interface IEditProfile {
    username: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    profilePic?: string;
    bio?:string;
    socialLinks?: Record<string, string>;
    onClose?:()=>void;
}

export interface ILogin {
    username?: string;
    email?: string;
    password?:string;
}

export interface ApiError extends Error{
  statusCode?: number | 400;
  message: string | "bad request";
  errors?: Record<string, string[]>;
  response:Record<string,string>;
}

export interface ILoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    loggedIn: User;
  };
}

