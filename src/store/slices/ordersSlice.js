import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as ordersApi from "../../api/orders";

export const fetchMyOrders = createAsyncThunk("orders/fetchMine", async (_, { rejectWithValue }) => {
  try {
    return await ordersApi.getMyOrders();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to load orders");
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ordersSlice.reducer;

export const selectOrders = (state) => state.orders?.items || [];
export const selectOrdersLoading = (state) => Boolean(state.orders?.loading);
export const selectOrdersError = (state) => state.orders?.error || null;
