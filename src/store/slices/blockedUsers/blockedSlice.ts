import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface BlockedUser {
  _id: string;
  blocked: {
    _id: string;
    username: string;
    fullName: string;
    profilePic?: string;
    bio?: string;
  };
  createdAt: string;
}

interface BlockedUsersState {
  users: BlockedUser[];
  nextCursor: string | null;
}

const initialState: BlockedUsersState = {
  users: [],
  nextCursor: null,
};

const blockedUsersSlice = createSlice({
  name: "blockedUsers",
  initialState,
  reducers: {
    // First load / refresh
    setBlockedUsers: (
      state,
      action: PayloadAction<{ data: BlockedUser[]; nextCursor: string | null }>
    ) => {
      state.users = action.payload.data;
      state.nextCursor = action.payload.nextCursor;
    },

    // Pagination (load more)
    addBlockedUsers: (
      state,
      action: PayloadAction<{ data: BlockedUser[]; nextCursor: string | null }>
    ) => {
      const incoming = action.payload.data;

      const filtered = incoming.filter(
        (u) => !state.users.some((existing) => existing._id === u._id)
      );

      state.users.push(...filtered);
      state.nextCursor = action.payload.nextCursor;
    },

    // Unblock
    removeBlockedUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(
        (item) => item.blocked._id !== action.payload
      );
    },

    // Logout / cleanup
    resetBlockedUsers: (state) => {
      state.users = [];
      state.nextCursor = null;
    },
  },
});

export const {
  setBlockedUsers,
  addBlockedUsers,
  removeBlockedUser,
  resetBlockedUsers,
} = blockedUsersSlice.actions;

export default blockedUsersSlice.reducer;
