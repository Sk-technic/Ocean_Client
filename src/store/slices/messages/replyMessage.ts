import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface IReply {
    messageId: string;
    openReply: boolean;
    isSender?: boolean | null;
    replyingUser?:string;
    content?:string;
}

const createReplySlice = createSlice({
    name: "replyMessage",
    initialState: {
        messageId: "",
        openReply: false,
    } as IReply,
    reducers: {
        setReplyMessage: (
            state,
            action: PayloadAction<IReply>
        ) => {
            state.messageId = action.payload.messageId;
            state.openReply = action.payload.openReply;
            state.isSender = action.payload.isSender;
            state.replyingUser = action.payload.replyingUser;
            state.content = action.payload.content
        },
        closeReplyMessage: (state) => {
            state.messageId = "";
            state.openReply = false;
            state.isSender = null;
            state.replyingUser = "",
            state.content = ''
        }

    },
});
export const { setReplyMessage, closeReplyMessage } = createReplySlice.actions;

export default createReplySlice.reducer;