import { ResultCode } from "common/enums"
import { handleServerAppError } from "common/utils/handleServerAppError"
import { handleServerNetworkError } from "common/utils/handleServerNetworkError"
import { setAppStatus } from "../../../app/app-reducer"
import { authApi } from "../api/authAPI"
import { LoginArgs } from "../api/authAPI.types"
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"

const initialState = {
  isLoggedIn: false,
  isInitialized: false,
}

const createSliceWithThunks = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })

const authSlice = createSliceWithThunks({
  name: "auth",
  initialState,
  reducers: (create) => {
    const createAThunk = create.asyncThunk.withTypes<{ rejectValue: null }>()
    return {
      loginTC: createAThunk(
        async (data: LoginArgs, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await authApi.login(data)
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              localStorage.setItem("sn-token", res.data.data.token)
              return { isLoggedIn: true }
            } else {
              handleServerAppError(res.data, dispatch)
              return rejectWithValue(null)
            }
          } catch (error: any) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
          }
        },
        {
          fulfilled: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
          }
        }
      ),
      logoutTC: createAThunk(
        async (undefined, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await authApi.logout()

            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              dispatch(clearTasksAndTodolists({}, []))
              localStorage.removeItem("sn-token")
              return { isLoggedIn: false }
            } else {
              handleServerAppError(res.data, dispatch)
              return rejectWithValue(null)
            }
          } catch (error: any) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
          }
        },
        {
          fulfilled: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn
          }
        }
      ),
      initializeAppTC: createAThunk(async (undefined, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatus({ status: "loading" }))
          const res = await authApi.me()

          if (res.data.resultCode === ResultCode.Success) {
            dispatch(setAppStatus({ status: "succeeded" }))
            return { isLoggedIn: true }
          } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
          }

        } catch (error: any) {
          handleServerNetworkError(error, dispatch)
          return rejectWithValue(null)
        }
      }, {
        fulfilled: (state, action) => {
          state.isLoggedIn = action.payload.isLoggedIn
        },
        settled: (state) => {
          state.isInitialized = true
        }
      })
    }
  },
  selectors: {
    selectIsLoggedIn: (state) => state.isLoggedIn,
    selectIsInitialized: (state) => state.isInitialized
  }
})

export const { loginTC, initializeAppTC, logoutTC } = authSlice.actions
export const { selectIsLoggedIn, selectIsInitialized } = authSlice.selectors

export default authSlice.reducer
