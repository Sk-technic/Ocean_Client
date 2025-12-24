import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "../../../types/chat";


interface Imessages {
    messages: Message[];
}
const initialState: Imessages = {
    messages: []
};
const createMessageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setMessages: (state, action: PayloadAction<{ messages: Message[] }>) => {
            state.messages = [];
            state.messages = action.payload.messages;
        },

        updateOldMessages: (state, action: PayloadAction<{ oldMessages: Message[] }>) => {
            const old = action.payload.oldMessages || [];
            const existingIds = new Set(state.messages.map(m => m._id));
            const filtered = old.filter(m => !existingIds.has(m._id));
            state.messages = [...filtered, ...state.messages];
        },
        clearRoomMessages: (state) => {
            console.log("message cleaning");
            
            state.messages = []
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            const incoming = action.payload;

            // Check if message already exists → update
            const index = state.messages.findIndex(msg => msg._id === incoming._id);

            if (index !== -1) {
                state.messages[index] = incoming;
                return;
            }

            // Otherwise push new message
            state.messages.push(incoming);
        },

        updateMessage: (state, action:PayloadAction<Message>) => {
            const index = state.messages.findIndex(msg => msg._id === action.payload._id);
            if (index !== -1) {
                state.messages[index] = action.payload;
            }
        },
        updateSeen :(state,action)=>{
            
            const index = state.messages.findIndex(msg => msg?._id === action.payload?._id);
            if(index !== -1){
                let message = state.messages[index]                
                message.status = action.payload.status
                message.seenBy = action.payload.seenBy
            }
        }
    }
});
export const { setMessages, addMessage, updateMessage, updateOldMessages, clearRoomMessages,updateSeen } = createMessageSlice.actions;

export default createMessageSlice.reducer;