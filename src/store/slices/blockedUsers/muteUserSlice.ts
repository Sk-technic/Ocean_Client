import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface MutedUser {
    _id: string;
    follower: {
        _id: string;
        username: string;
        fullName: string;
        profilePic?: string;
    };
}

interface MutedUsersState {
    users: MutedUser[];
    cursor: string | null;
}


const initialState: MutedUsersState = {
    users: [],
    cursor: null,
};

const mutedUsersSlice = createSlice({
    name: "mutedUsers",
    initialState,
    reducers: {
        setMutedUsers: (
            state,
            action: PayloadAction<{ data: MutedUser[]; cursor: string | null }>
        ) => {
            state.users = action.payload.data;
            state.cursor = action.payload.cursor;
        },
        addMutedUsers: (
            state,
            action: PayloadAction<{ data: MutedUser[]; cursor: string | null }>
        ) => {
            const incoming = action.payload.data;
            const filtered = incoming.filter(
                (u) => !state.users.some((existing) => existing._id === u._id)
            );
            state.users = [...state.users, ...filtered];
            state.cursor = action.payload.cursor;
        },

        removeMutedUser: (state, action: PayloadAction<string>) => {
            state.users = state.users.filter(
                (user) => user._id !== action.payload
            );
        },

        resetMutedUsers: (state) => {
            state.users = [];
            state.cursor = null;
        },
    },
});

export const { setMutedUsers, addMutedUsers, resetMutedUsers, removeMutedUser } = mutedUsersSlice.actions;
export default mutedUsersSlice.reducer;
