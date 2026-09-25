import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as userApi from "../../api/user";
import { clearTokens } from "../../utils/tokenService";

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    return await userApi.getMyProfile();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to load profile");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    return await userApi.updateMyProfile(payload);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to update profile");
  }
});

export const uploadProfilePhoto = createAsyncThunk("auth/uploadPhoto", async (file, { dispatch, rejectWithValue }) => {
  try {
    await userApi.uploadProfilePhoto(file);
    return await dispatch(fetchProfile()).unwrap();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to upload photo");
  }
});

export const deleteProfilePhoto = createAsyncThunk("auth/deletePhoto", async (_, { dispatch, rejectWithValue }) => {
  try {
    await userApi.deleteProfilePhoto();
    return await dispatch(fetchProfile()).unwrap();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to remove photo");
  }
});

export const createMyShop = createAsyncThunk("auth/createShop", async (payload, { dispatch, rejectWithValue }) => {
  try {
    await userApi.createMyShop(payload);
    return await dispatch(fetchProfile()).unwrap();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to submit shop request");
  }
});

const initialState = {
  profile: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signedOut: (state) => {
      state.profile = null;
      state.status = "idle";
      clearTokens();
    },
    profileHydrated: (state, action) => {
      state.profile = action.payload;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addMatcher(
        (action) => [updateProfile.fulfilled, uploadProfilePhoto.fulfilled, deleteProfilePhoto.fulfilled, createMyShop.fulfilled].some((t) => t.match(action)),
        (state, action) => {
          state.profile = action.payload;
        },
      );
  },
});

export const { signedOut, profileHydrated } = authSlice.actions;
export default authSlice.reducer;

export const selectProfile = (state) => state.auth.profile;
export const selectProfileStatus = (state) => state.auth.status;
export const selectShop = (state) => state.auth.profile?.shop ?? null;
export const selectShopStatus = (state) => state.auth.profile?.shop?.status ?? "NONE";
