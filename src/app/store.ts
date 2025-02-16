import { configureStore } from "@reduxjs/toolkit"
import appReducer from "./appSlice"
import { baseApi } from "./baseApi"
import { setupListeners } from "@reduxjs/toolkit/query"

export const store = configureStore({
  reducer: {
    app: appReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>

// Создаем тип диспатча который принимает как AC так и TC
export type AppDispatch = typeof store.dispatch

setupListeners(store.dispatch)
