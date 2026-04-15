import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const authHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${apiURL}/users/me/wishlist`, {
                headers: authHeaders(),
            });
            return data?.data?.products || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to fetch wishlist");
        }
    }
);

export const addToWishlistAPI = createAsyncThunk("wishlist/addToWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(
                `${apiURL}/users/me/wishlist/${productId}`,
                {},
                { headers: authHeaders() }
            );
            return data?.data?.products || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to add to wishlist");
        }
    }
);

export const removeFromWishlistAPI = createAsyncThunk("wishlist/removeFromWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(
                `${apiURL}/users/me/wishlist/${productId}`,
                { headers: authHeaders() }
            );
            return data?.data?.products || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to remove from wishlist");
        }
    }
);

export const clearWishlistAPI = createAsyncThunk("wishlist/clearWishlist",
    async (_, { rejectWithValue }) => {
        try {
            await axios.delete(`${apiURL}/users/me/wishlist`, { headers: authHeaders() });
            return [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || "Failed to clear wishlist");
        }
    }
);

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearWishlistError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        const setLoading = (state) => { state.loading = true; state.error = null; };
        const setItems = (state, action) => { state.loading = false; state.items = action.payload; };
        const setError = (state, action) => { state.loading = false; state.error = action.payload; };

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

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectWishlistItems = (state) => state.wishlist?.items || [];
export const selectWishlistLoading = (state) => Boolean(state.wishlist?.loading);
export const selectWishlistError = (state) => state.wishlist?.error || null;
export const selectIsInWishlist = (productId) => (state) => (state.wishlist?.items || []).some((p) => String(p.id) === String(productId));