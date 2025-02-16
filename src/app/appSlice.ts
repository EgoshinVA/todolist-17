import { createSlice, isFulfilled, isPending, isRejected } from "@reduxjs/toolkit"
import { todolistsApi } from "../features/todolists/api/todolistsApi"
import { tasksApi } from "../features/todolists/api/tasksApi"

export type ThemeMode = "dark" | "light"
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

const initialState = {
  themeMode: "light" as ThemeMode,
  status: "idle" as RequestStatus,
  error: null as string | null,
  isLoggedIn: false,
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: (create) => ({
    changeTheme: create.reducer<{ themeMode: ThemeMode }>((state, action) => {
      state.themeMode = action.payload.themeMode
    }),
    setAppStatus: create.reducer<{ status: RequestStatus }>((state, action) => {
      state.status = action.payload.status
    }),
    setAppError: create.reducer<{ error: string | null }>((state, action) => {
      state.error = action.payload.error
    }),
    setIsLoggedIn: create.reducer<boolean>((state, action) => {
      state.isLoggedIn = action.payload
    })
  }),
  selectors: {
    selectThemeMode: state => state.themeMode,
    selectAppStatus: state => state.status,
    selectAppError: state => state.error,
    selectIsLoggedIn: (state) => state.isLoggedIn,
  },
  extraReducers: builder => {
    builder.addMatcher(isPending, (state, action)=>{
      if(todolistsApi.endpoints.getTodolists.matchPending(action) || tasksApi.endpoints.getTasks.matchPending(action))
        return
      state.status = 'loading'
    }).addMatcher(isFulfilled, (state)=>{
      state.status = 'succeeded'
    }).addMatcher(isRejected, (state)=>{
      state.status = 'failed'
    })
  }
})

export const {changeTheme, setAppError, setAppStatus, setIsLoggedIn} = appSlice.actions;
export const {selectThemeMode, selectAppStatus, selectAppError, selectIsLoggedIn} = appSlice.selectors

export default appSlice.reducer;
