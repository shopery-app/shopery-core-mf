import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import cartReducer from "./reducers/cartReducer";
import userReducer from "./reducers/userReducer";
import productReducer from "./reducers/productReducer";

const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: [
    "isLocal",
    "localItems",
    "localTotalPrice",
    "productDetailsCache",
    "isCartOpen",
    "showSuccess",
    "lastAddedItem",
  ],
};

const rootPersistConfig = {
  key: "shopery-root",
  storage,
  whitelist: ["cart", "user"],
};

const rootReducer = combineReducers({
  cart: persistReducer(cartPersistConfig, cartReducer),
  user: userReducer,
  products: productReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
