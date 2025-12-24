import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 1. Pehle interface ko robust banate hain
interface IReply {
    messageId: string;
    openReply: boolean;
    isSender?: boolean | null;
    content?: string;
    // User details object (fullName aur profilePic zaroori hain UI ke liye)
    replyingUser?: {
        _id: string;
        fullName: string;
        username?: string;
        profilePic?: string;
    } | null;
    // Media support ke liye (taaki image/video preview dikh sake)
    media?: any[]; 
}

const initialState: IReply = {
    messageId: "",
    openReply: false,
    isSender: null,
    replyingUser: null,
    content: "",
    media: [],
};

const createReplySlice = createSlice({
    name: "replyMessage",
    initialState,
    reducers: {
        setReplyMessage: (
            state,
            action: PayloadAction<IReply>
        ) => {
            state.messageId = action.payload.messageId;
            state.openReply = action.payload.openReply;
            state.isSender = action.payload.isSender;
            state.replyingUser = action.payload.replyingUser;
            state.content = action.payload.content;
            state.media = action.payload.media || []; // Media agar hai toh save karein
        },
        closeReplyMessage: (state) => {
            state.messageId = "";
            state.openReply = false;
            state.isSender = null;
            state.replyingUser = null;
            state.content = "";
            state.media = [];
        }
    },
});

export const { setReplyMessage, closeReplyMessage } = createReplySlice.actions;
export default createReplySlice.reducer;