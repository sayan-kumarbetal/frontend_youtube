// import { configureStore } from "@reduxjs/toolkit";
// import authSlice from "./authSlice";

// const store = configureStore({
//   reducer: { auth: authSlice },
// });

// export default store;

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import authReducer from "./authSlice";

// ✅ Manual storage — works reliably with Vite
const storage = {
  getItem: key => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) =>
    Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: key => Promise.resolve(window.localStorage.removeItem(key)),
};

const persistConfig = {
  key: "auth",
  storage,
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/FLUSH",
          "persist/PAUSE",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
