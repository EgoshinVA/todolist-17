import { createSlice } from "@reduxjs/toolkit"

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
  }
})

export const {changeTheme, setAppError, setAppStatus, setIsLoggedIn} = appSlice.actions;
export const {selectThemeMode, selectAppStatus, selectAppError, selectIsLoggedIn} = appSlice.selectors

export default appSlice.reducer;
