import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storageModule from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import wishlistReducer from "./slices/wishlistSlice";
import productsReducer from "./slices/productsSlice";

const storage = storageModule.default ?? storageModule;

const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["isLocal", "localItems", "localTotalPrice", "productDetailsCache", "showSuccess", "lastAddedItem"],
};

const rootPersistConfig = {
  key: "shopery-root",
  storage,
  whitelist: ["cart"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: persistReducer(cartPersistConfig, cartReducer),
  orders: ordersReducer,
  wishlist: wishlistReducer,
  products: productsReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
