import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as wishlistApi from "../../api/wishlist";

export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const data = await wishlistApi.getMyWishlist();
    return data?.products || [];
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to fetch wishlist");
  }
});

export const addToWishlistAPI = createAsyncThunk("wishlist/add", async (productId, { rejectWithValue }) => {
  try {
    const data = await wishlistApi.addToWishlist(productId);
    return data?.products || [];
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to add to wishlist");
  }
});

export const removeFromWishlistAPI = createAsyncThunk("wishlist/remove", async (productId, { rejectWithValue }) => {
  try {
    const data = await wishlistApi.removeFromWishlist(productId);
    return data?.products || [];
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to remove from wishlist");
  }
});

export const clearWishlistAPI = createAsyncThunk("wishlist/clear", async (_, { rejectWithValue }) => {
  try {
    await wishlistApi.clearWishlist();
    return [];
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to clear wishlist");
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setItems = (state, action) => {
      state.loading = false;
      state.items = action.payload;
    };
    const setError = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };
    builder
      .addCase(fetchWishlist.pending, setLoading)
      .addCase(fetchWishlist.fulfilled, setItems)
      .addCase(fetchWishlist.rejected, setError)
      .addCase(addToWishlistAPI.pending, setLoading)
      .addCase(addToWishlistAPI.fulfilled, setItems)
      .addCase(addToWishlistAPI.rejected, setError)
      .addCase(removeFromWishlistAPI.pending, setLoading)
      .addCase(removeFromWishlistAPI.fulfilled, setItems)
      .addCase(removeFromWishlistAPI.rejected, setError)
      .addCase(clearWishlistAPI.pending, setLoading)
      .addCase(clearWishlistAPI.fulfilled, setItems)
      .addCase(clearWishlistAPI.rejected, setError);
  },
});

export default wishlistSlice.reducer;

export const selectWishlistItems = (state) => state.wishlist?.items || [];
export const selectWishlistLoading = (state) => Boolean(state.wishlist?.loading);
export const selectWishlistError = (state) => state.wishlist?.error || null;
