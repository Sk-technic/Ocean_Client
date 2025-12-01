import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface EditMessageState {
    editingMessageId: string | null;
    newContent: string;
}

const initialState: EditMessageState = {
    editingMessageId: null,
    newContent: "",
};

const createEditMessageSlice = createSlice({
    name: "editMessage",
    initialState,
    reducers: {
        setEditMessage: (
            state,
            action: PayloadAction<{ messageId: string; currentContent: string }>
        ) => {
            state.editingMessageId = action.payload.messageId;
            state.newContent = action.payload.currentContent;
        },

        updateNewContent: (state, action: PayloadAction<string>) => {
            state.newContent = action.payload;
        },

        stopEditingMessage: (state) => {
            state.editingMessageId = null;
            state.newContent = "";
        },
    },
});

export const { setEditMessage, updateNewContent, stopEditingMessage } =
    createEditMessageSlice.actions;

export default createEditMessageSlice.reducer;
