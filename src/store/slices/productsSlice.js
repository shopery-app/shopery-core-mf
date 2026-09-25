import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as productsApi from "../../api/products";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async ({ page = 0, size = 20, sort, category, condition, priceRange, keyword } = {}, { rejectWithValue }) => {
    try {
      const params = { page, size, sort, category, condition, keyword };
      if (priceRange && Array.isArray(priceRange)) {
        params.minPrice = priceRange[0];
        params.maxPrice = priceRange[1];
      }
      const data = await productsApi.searchProducts(params);
      return {
        content: data?.content || [],
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
        currentPage: page,
        pageSize: size,
      };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch products");
    }
  },
);

export const fetchProductDetails = createAsyncThunk("products/fetchDetails", async (productId, { rejectWithValue }) => {
  try {
    return await productsApi.getProductById(productId);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || "Failed to fetch product details");
  }
});

const initialState = {
  products: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 20,
  productDetails: {},
  loading: false,
  error: null,
  filters: { category: null, priceRange: null, condition: null, keyword: "", sort: "createdAt,desc" },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: null, priceRange: null, condition: null, keyword: "", sort: "createdAt,desc" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { content, totalElements, totalPages, currentPage, pageSize } = action.payload;
        state.products = currentPage === 0 ? content : [...state.products, ...content];
        state.totalElements = totalElements;
        state.totalPages = totalPages;
        state.currentPage = currentPage;
        state.pageSize = pageSize;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.productDetails[action.meta.arg] = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;

export const selectProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectFilters = (state) => state.products.filters;
export const selectProductDetail = (id) => (state) => state.products.productDetails[id];
export const selectPagination = (state) => ({
  totalElements: state.products.totalElements,
  totalPages: state.products.totalPages,
  currentPage: state.products.currentPage,
  pageSize: state.products.pageSize,
});
