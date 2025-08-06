import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "firebase/auth";

// Serializable user data interface
interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface UserState {
  user: SerializableUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: true,
  error: null,
};

// Helper function to extract serializable data from Firebase User
const serializeUser = (user: User | null): SerializableUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = serializeUser(action.payload);
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setUser, setLoading, setError, clearUser } = userSlice.actions;
export default userSlice.reducer;
export type { SerializableUser };
