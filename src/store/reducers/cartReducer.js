import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiURL } from "../../Backend/Api/api";

export const addProductToCart = createAsyncThunk("cart/addProductToCart",
  async (
    { productId, quantity = 1, productData = null },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const url = `${apiURL}/users/me/cart/${productId}`;
      const { data } = await axios.post(url, { quantity });
      return { ok: true, data };
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403 || status === 409) {
        dispatch(
          addToLocalCart({
            productId,
            quantity,
            productData: productData || null,
          }),
        );
        return { ok: false, fallbackToLocal: true };
      }
      return rejectWithValue(err?.response?.data || "Cart add failed");
    }
  },
);

export const fetchCart = createAsyncThunk("cart/fetchCart",
  async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return { item: [], totalPrice: 0, isLocal: true };
      }

      const response = await axios.get(`${apiURL}/users/me/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "OK") {
        return {
          cartData: response.data.data,
          isLocal: false,
        };
      }

      throw new Error("Failed to fetch cart");
    } catch (error) {
      console.error("❌ Error fetching cart:", error);

      return { items: [], totalPrice: 0, isLocal: true };
    }
  },
);

const EMPTY_OBJ = Object.freeze({});

const initialState = {
  isLocal: true,
  localItems: [],
  localTotalPrice: 0,
  productDetailsCache: {},

  isCartOpen: false,
  showSuccess: false,
  lastAddedItem: null,

  backendItems: [],
  backendTotalPrice: 0,

  loading: false,
  error: null,
};

const priceFrom = (item, details) => {
  return Number(
    item?.price ??
      item?.currentPrice ??
      item?.productData?.currentPrice ??
      item?.productData?.price ??
      details?.currentPrice ??
      details?.price ??
      0,
  );
};

const recalcLocal = (state) => {
  state.localTotalPrice = state.localItems.reduce((sum, it) => {
    const d = state.productDetailsCache[it.productId] || EMPTY_OBJ;
    const p = priceFrom(it, d);
    return sum + p * Number(it.quantity || 0);
  }, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToLocalCart: (state, action) => {
      const { productId, quantity = 1, productData = null } = action.payload;
      const idx = state.localItems.findIndex((x) => x.productId === productId);
      if (idx > -1) {
        state.localItems[idx].quantity += quantity;
      } else {
        state.localItems.push({
          productId,
          quantity,
          productData: productData || null,
        });
      }
      if (productData) {
        state.productDetailsCache[productId] = productData;
      }
      state.lastAddedItem = productData || null;
      state.showSuccess = Boolean(productData);
      recalcLocal(state);
    },
    removeFromLocalCart: (state, action) => {
      const { productId } = action.payload;
      state.localItems = state.localItems.filter(
        (x) => x.productId !== productId,
      );
      recalcLocal(state);
    },
    updateLocalCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const it = state.localItems.find((x) => x.productId === productId);
      if (it) it.quantity = Math.max(1, Number(quantity || 1));
      recalcLocal(state);
    },
    clearLocalCart: (state) => {
      state.localItems = [];
      state.localTotalPrice = 0;
    },
    cacheProductDetails: (state, action) => {
      const { productId, productData } = action.payload;
      state.productDetailsCache[productId] = productData;
      recalcLocal(state);
    },
    showCartSuccess: (state, action) => {
      state.showSuccess = true;
      state.lastAddedItem = action.payload || null;
    },
    hideCartSuccess: (state) => {
      state.showSuccess = false;
      state.lastAddedItem = null;
    },
    toggleCartSidebar: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action) => {
      state.isCartOpen = Boolean(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProductToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProductToCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addProductToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Cart error";
      });
  },
});

export const {
  addToLocalCart,
  removeFromLocalCart,
  updateLocalCartQuantity,
  clearLocalCart,
  cacheProductDetails,
  clearError,
  showCartSuccess,
  hideCartSuccess,
  toggleCartSidebar,
  setCartOpen,
} = cartSlice.actions;

export const selectProductDetailsCache = (state) =>
  state.cart?.productDetailsCache || EMPTY_OBJ;

export const selectIsLocalCart = (state) => Boolean(state.cart?.isLocal);

export const selectCartItems = (state) =>
  state.cart?.isLocal
    ? state.cart?.localItems || []
    : state.cart?.backendItems || [];

export const selectCartTotal = (state) =>
  Number(
    state.cart?.isLocal
      ? state.cart?.localTotalPrice || 0
      : state.cart?.backendTotalPrice || 0,
  );

export const selectCartItemCount = (state) =>
  (selectCartItems(state) || []).reduce(
    (t, it) => t + Number(it?.quantity || 0),
    0,
  );

export const selectCartLoading = (state) => Boolean(state.cart?.loading);
export const selectCartError = (state) => state.cart?.error || null;
export const selectIsCartOpen = (state) => Boolean(state.cart?.isCartOpen);
export const selectShowSuccessMessage = (state) => Boolean(state.cart?.showSuccess);
export const selectLastAddedItem = (state) => state.cart?.lastAddedItem || null;

export default cartSlice.reducer;
