import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as cartApi from "../../api/cart";
import * as paymentsApi from "../../api/payments";
import { isAuthenticated } from "../../utils/auth";
import { toImageSrc } from "../../utils/image";

const EMPTY = Object.freeze({});

const priceFrom = (item, cache) =>
  Number(item?.price ?? item?.productData?.currentPrice ?? item?.productData?.price ?? cache?.currentPrice ?? cache?.price ?? 0);

const recalcLocal = (state) => {
  state.localTotalPrice = state.localItems.reduce((sum, it) => {
    const cache = state.productDetailsCache[it.productId] || EMPTY;
    return sum + priceFrom(it, cache) * Number(it.quantity || 0);
  }, 0);
};

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  if (!isAuthenticated()) return { isLocal: true };
  const data = await cartApi.getMyCart();
  return { isLocal: false, items: data?.items || [], totalPrice: Number(data?.totalPrice || 0) };
});

export const addProductToCart = createAsyncThunk(
  "cart/addProduct",
  async ({ productId, quantity = 1, productData = null }, { dispatch, rejectWithValue }) => {
    if (!isAuthenticated()) {
      dispatch(addToLocalCart({ productId, quantity, productData }));
      return { isLocal: true };
    }
    try {
      const data = await cartApi.addToCart(productId, quantity);
      return { isLocal: false, items: data?.items || [], totalPrice: Number(data?.totalPrice || 0), productData };
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403 || status === 409) {
        dispatch(addToLocalCart({ productId, quantity, productData }));
        return { isLocal: true, productData };
      }
      return rejectWithValue(err?.response?.data?.message || "Could not add to cart");
    }
  },
);

export const updateCartQuantityAPI = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { dispatch }) => {
    if (!isAuthenticated()) {
      dispatch(updateLocalCartQuantity({ productId, quantity }));
      return { isLocal: true };
    }
    const data = await cartApi.updateCartItem(productId, quantity);
    return { isLocal: false, items: data?.items || [], totalPrice: Number(data?.totalPrice || 0) };
  },
);

export const removeProductFromCartAPI = createAsyncThunk("cart/removeProduct", async (productId, { dispatch }) => {
  if (!isAuthenticated()) {
    dispatch(removeFromLocalCart({ productId }));
    return { isLocal: true };
  }
  const data = await cartApi.removeFromCart(productId);
  return { isLocal: false, items: data?.items || [], totalPrice: Number(data?.totalPrice || 0) };
});

export const clearCartAPI = createAsyncThunk("cart/clear", async (_, { dispatch }) => {
  if (!isAuthenticated()) {
    dispatch(clearLocalCart());
    return { isLocal: true };
  }
  await cartApi.clearCart();
  return { isLocal: false, items: [], totalPrice: 0 };
});

export const checkoutAPI = createAsyncThunk("cart/checkout", async (_, { rejectWithValue }) => {
  try {
    return await paymentsApi.createCheckoutSession();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Checkout failed. Please try again.");
  }
});

const initialState = {
  isLocal: true,
  localItems: [],
  localTotalPrice: 0,
  productDetailsCache: {},
  backendItems: [],
  backendTotalPrice: 0,
  showSuccess: false,
  lastAddedItem: null,
  checkoutLoading: false,
  checkoutError: null,
  stripeSession: null,
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
      const stock = Number(productData?.stockQuantity ?? state.productDetailsCache[productId]?.stockQuantity ?? 0);

      if (idx > -1) {
        const nextQty = state.localItems[idx].quantity + quantity;
        state.localItems[idx].quantity = stock > 0 ? Math.min(nextQty, stock) : nextQty;
      } else {
        const safeQty = stock > 0 ? Math.min(quantity, stock) : quantity;
        if (safeQty > 0) state.localItems.push({ productId, quantity: safeQty, productData });
      }
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
      const item = state.localItems.find((x) => x.productId === productId);
      if (!item) return;
      const stock = Number(item.productData?.stockQuantity ?? state.productDetailsCache[productId]?.stockQuantity ?? 0);
      item.quantity = stock > 0 ? Math.min(Math.max(1, quantity), stock) : Math.max(1, quantity);
      recalcLocal(state);
    },
    clearLocalCart: (state) => {
      state.localItems = [];
      state.localTotalPrice = 0;
    },
    hideCartSuccess: (state) => {
      state.showSuccess = false;
      state.lastAddedItem = null;
    },
    clearCartError: (state) => {
      state.error = null;
    },
    clearCheckoutError: (state) => {
      state.checkoutError = null;
    },
    clearStripeSession: (state) => {
      state.stripeSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (!action.payload.isLocal) applyBackendCart(state, action.payload.items, action.payload.totalPrice);
        else state.isLocal = true;
      })
      .addCase(addProductToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductToCart.fulfilled, (state, action) => {
        const { items, totalPrice, isLocal, productData } = action.payload;
        if (!isLocal) applyBackendCart(state, items, totalPrice);
        if (productData) {
          state.showSuccess = true;
          state.lastAddedItem = productData;
        }
        state.loading = false;
      })
      .addCase(addProductToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeProductFromCartAPI.fulfilled, (state, action) => {
        if (!action.payload.isLocal) applyBackendCart(state, action.payload.items, action.payload.totalPrice);
      })
      .addCase(updateCartQuantityAPI.fulfilled, (state, action) => {
        if (!action.payload.isLocal) applyBackendCart(state, action.payload.items, action.payload.totalPrice);
      })
      .addCase(clearCartAPI.fulfilled, (state, action) => {
        if (!action.payload.isLocal) applyBackendCart(state, [], 0);
      })
      .addCase(checkoutAPI.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
        state.stripeSession = null;
      })
      .addCase(checkoutAPI.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.stripeSession = action.payload;
      })
      .addCase(checkoutAPI.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload;
      });
  },
});

export const {
  addToLocalCart,
  removeFromLocalCart,
  updateLocalCartQuantity,
  clearLocalCart,
  hideCartSuccess,
  clearCartError,
  clearCheckoutError,
  clearStripeSession,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectIsLocalCart = (state) => Boolean(state.cart?.isLocal);

export const selectCartItems = (state) => {
  if (state.cart?.isLocal) return state.cart?.localItems || [];
  return (state.cart?.backendItems || []).map((ci) => ({
    productId: ci.product?.id,
    quantity: ci.quantity,
    product: ci.product,
    name: ci.product?.productName || "Product",
    imageUrl: toImageSrc(ci.product?.image),
    price: Number(ci.product?.currentPrice || 0),
    originalPrice: Number(ci.product?.discountDto?.originalPrice || 0),
    stockQuantity: ci.product?.stockQuantity,
  }));
};

export const selectCartTotal = (state) =>
  Number(state.cart?.isLocal ? state.cart?.localTotalPrice || 0 : state.cart?.backendTotalPrice || 0);
export const selectCartItemCount = (state) => selectCartItems(state).reduce((t, it) => t + Number(it?.quantity || 0), 0);
export const selectCartLoading = (state) => Boolean(state.cart?.loading);
export const selectCartError = (state) => state.cart?.error || null;
export const selectShowCartSuccess = (state) => Boolean(state.cart?.showSuccess);
export const selectLastAddedItem = (state) => state.cart?.lastAddedItem || null;
export const selectCheckoutLoading = (state) => Boolean(state.cart?.checkoutLoading);
export const selectCheckoutError = (state) => state.cart?.checkoutError || null;
export const selectStripeSession = (state) => state.cart?.stripeSession || null;
