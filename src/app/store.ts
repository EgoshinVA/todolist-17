import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/model/auth-reducer"
import appReducer from "./app-reducer"
import todolistsReducer from "../features/todolists/model/todolists-reducer"
import tasksReducer from "../features/todolists/model/tasks-reducer"
import { baseApi } from "./baseApi"
import { setupListeners } from "@reduxjs/toolkit/query"

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>

// Создаем тип диспатча который принимает как AC так и TC
export type AppDispatch = typeof store.dispatch

setupListeners(store.dispatch)
