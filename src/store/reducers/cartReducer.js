import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return { items: [], totalPrice: 0, isLocal: true };
    const { data } = await axios.get(`${apiURL}/users/me/cart`, { headers: authHeaders() });
    return { items: data?.data?.items || [], totalPrice: Number(data?.data?.totalPrice || 0), isLocal: false };
  } catch (err) {
    return { items: [], totalPrice: 0, isLocal: true };
  }
});

export const addProductToCart = createAsyncThunk("cart/addProductToCart",
    async ({ productId, quantity = 1, productData = null }, { dispatch, rejectWithValue }) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch(addToLocalCart({ productId, quantity, productData }));
        return { isLocal: true };
      }
      try {
        const { data } = await axios.post(
            `${apiURL}/users/me/cart/${productId}`,
            { quantity },
            { headers: authHeaders() }
        );
        const cartData = data?.data;
        return {
          items: cartData?.items || [],
          totalPrice: Number(cartData?.totalPrice || 0),
          isLocal: false,
          productData,
        };
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403 || status === 409) {
          dispatch(addToLocalCart({ productId, quantity, productData }));
          return { isLocal: true, productData };
        }
        return rejectWithValue(err?.response?.data?.message || "Cart add failed");
      }
    }
);

export const removeProductFromCartAPI = createAsyncThunk("cart/removeProduct",
    async (productId, { dispatch, rejectWithValue }) => {
      const token = localStorage.getItem("accessToken");
      if (!token) { dispatch(removeFromLocalCart({ productId })); return { isLocal: true }; }
      try {
        const { data } = await axios.delete(`${apiURL}/users/me/cart/${productId}`, { headers: authHeaders() });
        const cartData = data?.data;
        return { items: cartData?.items || [], totalPrice: Number(cartData?.totalPrice || 0), isLocal: false };
      } catch {
        dispatch(removeFromLocalCart({ productId }));
        return { isLocal: true };
      }
    }
);

export const updateCartQuantityAPI = createAsyncThunk("cart/updateQuantity",
    async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
      const token = localStorage.getItem("accessToken");
      if (!token) { dispatch(updateLocalCartQuantity({ productId, quantity })); return { isLocal: true }; }
      try {
        const { data } = await axios.put(
            `${apiURL}/users/me/cart/${productId}`,
            { quantity },
            { headers: authHeaders() }
        );
        const cartData = data?.data;
        return { items: cartData?.items || [], totalPrice: Number(cartData?.totalPrice || 0), isLocal: false };
      } catch {
        dispatch(updateLocalCartQuantity({ productId, quantity }));
        return { isLocal: true };
      }
    }
);

export const clearCartAPI = createAsyncThunk("cart/clearCart",
    async (_, { dispatch, rejectWithValue }) => {
      const token = localStorage.getItem("accessToken");
      if (!token) { dispatch(clearLocalCart()); return { isLocal: true }; }
      try {
        await axios.delete(`${apiURL}/users/me/cart`, { headers: authHeaders() });
        return { items: [], totalPrice: 0, isLocal: false };
      } catch {
        dispatch(clearLocalCart());
        return { isLocal: true };
      }
    }
);

export const checkoutAPI = createAsyncThunk("cart/checkout",
    async (_, { rejectWithValue }) => {
      try {
        const { data } = await axios.post(`${apiURL}/users/me/orders/checkout`, {}, { headers: authHeaders() });
        return data?.data || [];
      } catch (err) {
        return rejectWithValue(err?.response?.data?.message || "Checkout failed");
      }
    }
);

export const fetchMyOrders = createAsyncThunk("cart/fetchMyOrders",
    async (_, { rejectWithValue }) => {
      try {
        const { data } = await axios.get(`${apiURL}/users/me/orders/me`, { headers: authHeaders() });
        return data?.data || [];
      } catch (err) {
        return rejectWithValue(err?.response?.data?.message || "Failed to fetch orders");
      }
    }
);

const EMPTY_OBJ = Object.freeze({});

const priceFrom = (item, cache) =>
    Number(
        item?.price ??
        item?.currentPrice ??
        item?.productData?.currentPrice ??
        item?.productData?.price ??
        cache?.currentPrice ??
        cache?.price ??
        0
    );

const recalcLocal = (state) => {
  state.localTotalPrice = state.localItems.reduce((sum, it) => {
    const d = state.productDetailsCache[it.productId] || EMPTY_OBJ;
    return sum + priceFrom(it, d) * Number(it.quantity || 0);
  }, 0);
};

const initialState = {
  isLocal: true,
  localItems: [],
  localTotalPrice: 0,
  productDetailsCache: {},
  backendItems: [],
  backendTotalPrice: 0,
  showSuccess: false,
  lastAddedItem: null,
  orders: [],
  ordersLoading: false,
  ordersError: null,
  checkoutLoading: false,
  checkoutError: null,
  loading: false,
  error: null,
};

const applyBackendCart = (state, items, totalPrice) => {
  state.backendItems = items;
  state.backendTotalPrice = totalPrice;
  state.isLocal = false;
  state.loading = false;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToLocalCart: (state, action) => {
      const { productId, quantity = 1, productData = null } = action.payload;
      const idx = state.localItems.findIndex((x) => x.productId === productId);
      if (idx > -1) { state.localItems[idx].quantity += quantity; }
      else { state.localItems.push({ productId, quantity, productData }); }
      if (productData) state.productDetailsCache[productId] = productData;
      state.lastAddedItem = productData;
      state.showSuccess = Boolean(productData);
      recalcLocal(state);
    },
    removeFromLocalCart: (state, action) => {
      state.localItems = state.localItems.filter((x) => x.productId !== action.payload.productId);
      recalcLocal(state);
    },
    updateLocalCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const it = state.localItems.find((x) => x.productId === productId);
      if (it) it.quantity = Math.max(1, Number(quantity || 1));
      recalcLocal(state);
    },
    clearLocalCart: (state) => { state.localItems = []; state.localTotalPrice = 0; },
    cacheProductDetails: (state, action) => {
      const { productId, productData } = action.payload;
      state.productDetailsCache[productId] = productData;
      recalcLocal(state);
    },
    showCartSuccess: (state, action) => { state.showSuccess = true; state.lastAddedItem = action.payload || null; },
    hideCartSuccess: (state) => { state.showSuccess = false; state.lastAddedItem = null; },
    clearError: (state) => { state.error = null; },
    clearCheckoutError: (state) => { state.checkoutError = null; },
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchCart.fulfilled, (state, action) => {
          const { items, totalPrice, isLocal } = action.payload;
          if (!isLocal) applyBackendCart(state, items, totalPrice);
          else state.isLocal = true;
        })
        .addCase(addProductToCart.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(addProductToCart.fulfilled, (state, action) => {
          const { items, totalPrice, isLocal, productData } = action.payload;
          if (!isLocal) applyBackendCart(state, items, totalPrice);
          if (productData) { state.showSuccess = true; state.lastAddedItem = productData; }
          state.loading = false;
        })
        .addCase(addProductToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
        .addCase(removeProductFromCartAPI.fulfilled, (state, action) => {
          if (!action.payload.isLocal) applyBackendCart(state, action.payload.items, action.payload.totalPrice);
        })
        .addCase(updateCartQuantityAPI.fulfilled, (state, action) => {
          if (!action.payload.isLocal) applyBackendCart(state, action.payload.items, action.payload.totalPrice);
        })
        .addCase(clearCartAPI.fulfilled, (state, action) => {
          if (!action.payload.isLocal) applyBackendCart(state, [], 0);
        })
        .addCase(checkoutAPI.pending, (state) => { state.checkoutLoading = true; state.checkoutError = null; })
        .addCase(checkoutAPI.fulfilled, (state, action) => {
          state.checkoutLoading = false;
          state.orders = action.payload;
          state.backendItems = [];
          state.backendTotalPrice = 0;
        })
        .addCase(checkoutAPI.rejected, (state, action) => { state.checkoutLoading = false; state.checkoutError = action.payload; })
        .addCase(fetchMyOrders.pending, (state) => { state.ordersLoading = true; state.ordersError = null; })
        .addCase(fetchMyOrders.fulfilled, (state, action) => { state.ordersLoading = false; state.orders = action.payload; })
        .addCase(fetchMyOrders.rejected, (state, action) => { state.ordersLoading = false; state.ordersError = action.payload; });
  },
});

export const {
  addToLocalCart,
  removeFromLocalCart,
  updateLocalCartQuantity,
  clearLocalCart,
  cacheProductDetails,
  showCartSuccess,
  hideCartSuccess,
  clearError,
  clearCheckoutError,
} = cartSlice.actions;

export const selectProductDetailsCache = (state) => state.cart?.productDetailsCache || EMPTY_OBJ;
export const selectIsLocalCart = (state) => Boolean(state.cart?.isLocal);

export const selectCartItems = (state) => {
  if (state.cart?.isLocal) return state.cart?.localItems || [];
  return (state.cart?.backendItems || []).map((ci) => ({
    productId: ci.product?.id,
    quantity: ci.quantity,
    product: ci.product,
    name: ci.product?.productName || "Product",
    imageUrl: ci.product?.imageUrl || "",
    price: Number(ci.product?.currentPrice || 0),
    originalPrice: Number(ci.product?.discountDto?.originalPrice || 0),
    category: ci.product?.category || "",
  }));
};

export const selectCartTotal = (state) => Number(state.cart?.isLocal ? state.cart?.localTotalPrice || 0 : state.cart?.backendTotalPrice || 0);
export const selectCartItemCount = (state) => selectCartItems(state).reduce((t, it) => t + Number(it?.quantity || 0), 0);
export const selectCartLoading = (state) => Boolean(state.cart?.loading);
export const selectCartError = (state) => state.cart?.error || null;
export const selectShowSuccessMessage = (state) => Boolean(state.cart?.showSuccess);
export const selectLastAddedItem = (state) => state.cart?.lastAddedItem || null;
export const selectOrders = (state) => state.cart?.orders || [];
export const selectOrdersLoading = (state) => Boolean(state.cart?.ordersLoading);
export const selectCheckoutLoading = (state) => Boolean(state.cart?.checkoutLoading);
export const selectCheckoutError = (state) => state.cart?.checkoutError || null;

export default cartSlice.reducer;