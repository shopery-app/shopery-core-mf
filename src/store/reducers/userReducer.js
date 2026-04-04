import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  userInfo: null,
  preferences: {
    currency: "USD",
    language: "en",
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
  },
});

export default userSlice.reducer;
