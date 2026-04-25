import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,   // renamed to userData
    loading: false,
    error: null
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload; // store full user object here
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.userData = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const { setUserData, setLoading, setError, clearUser } = userSlice.actions;
export default userSlice.reducer;
