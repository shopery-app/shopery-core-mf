import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import axios from "axios";

import { apiURL } from "../../Backend/Api/api";

const CACHE_TIMEOUT = 300000;

// Helper: extract page data from any response shape the backend might return
const extractPageData = (responseData) => {
  // Shape 1: { status: "OK", data: { content, totalElements, totalPages } }
  if (responseData?.data?.content !== undefined) {
    return responseData.data;
  }
  // Shape 2: { content, totalElements, totalPages } (no wrapper)
  if (responseData?.content !== undefined) {
    return responseData;
  }
  // Shape 3: { data: [...] } (array directly)
  if (Array.isArray(responseData?.data)) {
    return {
      content: responseData.data,
      totalElements: responseData.data.length,
      totalPages: 1,
    };
  }
  // Shape 4: plain array
  if (Array.isArray(responseData)) {
    return {
      content: responseData,
      totalElements: responseData.length,
      totalPages: 1,
    };
  }
  return null;
};

export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (
        { page = 0, size = 20, sort = "createdAt,desc", force = false, category = null, condition = null, priceRange = null, keyword = "" } = {},
        { rejectWithValue, getState },
    ) => {
      try {
        const hasFilters = category || condition || priceRange || keyword;

        if (page === 0 && !force && !hasFilters) {
          const state = getState();
          const { lastFetch, products } = state.products;

          if (lastFetch && products.length > 0) {
            const timeSinceLastFetch = Date.now() - new Date(lastFetch).getTime();
            if (timeSinceLastFetch < CACHE_TIMEOUT) {
              return {
                content: products,
                totalElements: state.products.totalElements,
                totalPages: state.products.totalPages,
                currentPage: state.products.currentPage,
                pageSize: state.products.pageSize,
                fromCache: true,
              };
            }
          }
        }

        const params = { page, size, sort };
        if (category) params.category = category;
        if (condition) params.condition = condition;
        if (keyword) params.keyword = keyword;
        if (priceRange && Array.isArray(priceRange)) {
          params.minPrice = priceRange[0];
          params.maxPrice = priceRange[1];
        }

        const response = await axios.get(`${apiURL}/products`, {
          params,
          headers: { "Content-Type": "application/json" },
        });

        const pageData = extractPageData(response.data);
        if (!pageData) {
          return rejectWithValue("Invalid response format from server");
        }

        return {
          content: pageData.content || [],
          totalElements: pageData.totalElements ?? pageData.content?.length ?? 0,
          totalPages: pageData.totalPages ?? 1,
          currentPage: page,
          pageSize: size,
        };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch products");
      }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    "products/fetchFeaturedProducts",
    async (_, { rejectWithValue, getState }) => {
      try {
        const state = getState();
        const { featuredLastFetch, featuredProducts } = state.products;

        if (featuredLastFetch && featuredProducts.length > 0) {
          const timeSinceLastFetch = Date.now() - new Date(featuredLastFetch).getTime();
          if (timeSinceLastFetch < CACHE_TIMEOUT) {
            return featuredProducts;
          }
        }

        const { data } = await axios.get(`${apiURL}/products`, {
          params: { page: 0, size: 20, sort: "createdAt,desc" },
        });

        const pageData = extractPageData(data);
        const products = pageData?.content ?? [];
        return Array.isArray(products) ? products : [];
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch featured products");
      }
    },
);

export const fetchProductDetails = createAsyncThunk(
    "products/fetchProductDetails",
    async (productId, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${apiURL}/products/${productId}`, {
          headers: { "Content-Type": "application/json" },
        });

        // Accept either wrapped or unwrapped response
        const product = response.data?.data ?? response.data;
        if (!product || typeof product !== "object") {
          throw new Error("Product not found");
        }
        return product;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch product details");
      }
    },
);

export const ensureDetailsForProducts = createAsyncThunk(
    "products/ensureDetailsForProducts",
    async (ids = [], { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const cached = state.products.productDetails || {};
        const missing = ids.filter((id) => !cached[id]);
        if (missing.length === 0) return [];

        const chunk = (arr, size) =>
            Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
                arr.slice(i * size, i * size + size),
            );

        const chunks = chunk(missing, 6);
        const results = [];

        for (const group of chunks) {
          const reqs = group.map((id) =>
              axios
                  .get(`${apiURL}/products/${id}`, {
                    headers: { "Content-Type": "application/json" },
                  })
                  .then((res) => {
                    const data = res.data?.data ?? res.data;
                    return { id, ok: true, data };
                  })
                  .catch((err) => ({ id, ok: false, error: err })),
          );
          const settled = await Promise.all(reqs);
          results.push(...settled.filter((r) => r.ok));
        }

        return results;
      } catch (error) {
        return rejectWithValue("Failed to fetch product details batch");
      }
    },
);

const initialState = {
  products: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 20,

  featuredProducts: [],
  productDetails: {},

  loading: false,
  featuredLoading: false,
  detailsLoading: {},

  error: null,
  featuredError: null,
  detailsErrors: {},

  filters: {
    category: null,
    priceRange: null,
    condition: null,
    keyword: "",
  },

  lastFetch: null,
  featuredLastFetch: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { category: null, priceRange: null, condition: null, keyword: "" };
    },
    cacheProductDetails: (state, action) => {
      const { productId, productData } = action.payload;
      state.productDetails[productId] = {
        ...productData,
        cachedAt: new Date().toISOString(),
      };
    },
    clearProductCache: (state) => {
      state.productDetails = {};
    },
    clearErrors: (state) => {
      state.error = null;
      state.featuredError = null;
      state.detailsErrors = {};
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
          const { content, totalElements, totalPages, currentPage, pageSize, fromCache } = action.payload;

          if (fromCache) return;

          state.products = currentPage === 0 ? content : [...state.products, ...content];
          state.totalElements = totalElements;
          state.totalPages = totalPages;
          state.currentPage = currentPage;
          state.pageSize = pageSize;
          state.lastFetch = new Date().toISOString();
        })
        .addCase(fetchProducts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch products";
        })
        .addCase(fetchFeaturedProducts.pending, (state) => {
          state.featuredLoading = true;
          state.featuredError = null;
        })
        .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
          state.featuredLoading = false;
          state.featuredProducts = action.payload;
          state.featuredLastFetch = new Date().toISOString();
        })
        .addCase(fetchFeaturedProducts.rejected, (state, action) => {
          state.featuredLoading = false;
          state.featuredError = action.payload || "Failed to fetch featured products";
        })
        .addCase(fetchProductDetails.pending, (state, action) => {
          const productId = action.meta.arg;
          state.detailsLoading[productId] = true;
          delete state.detailsErrors[productId];
        })
        .addCase(fetchProductDetails.fulfilled, (state, action) => {
          const productId = action.meta.arg;
          state.detailsLoading[productId] = false;
          state.productDetails[productId] = {
            ...action.payload,
            cachedAt: new Date().toISOString(),
          };
        })
        .addCase(fetchProductDetails.rejected, (state, action) => {
          const productId = action.meta.arg;
          state.detailsLoading[productId] = false;
          state.detailsErrors[productId] = action.payload || "Failed to fetch product details";
        })
        .addCase(ensureDetailsForProducts.fulfilled, (state, action) => {
          for (const item of action.payload) {
            const { id, data } = item;
            state.productDetails[id] = {
              ...data,
              cachedAt: new Date().toISOString(),
            };
          }
        });
  },
});

export const {
  setFilters,
  clearFilters,
  cacheProductDetails,
  clearProductCache,
  clearErrors,
} = productSlice.actions;

export default productSlice.reducer;

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectProductById = (productId) => (state) => state.products.productDetails[productId];
export const selectProductsLoading = (state) => state.products.loading;
export const selectFeaturedLoading = (state) => state.products.featuredLoading;
export const selectProductsError = (state) => state.products.error;
export const selectFilters = (state) => state.products.filters;
export const selectProductDetails = (state) => state.products.productDetails;
export const selectPagination = (state) => ({
  totalElements: state.products.totalElements,
  totalPages: state.products.totalPages,
  currentPage: state.products.currentPage,
  pageSize: state.products.pageSize,
});

export const selectFilteredProducts = (state) => state.products.products;