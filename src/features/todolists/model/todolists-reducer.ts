import { ResultCode } from "common/enums"
import { handleServerAppError } from "common/utils/handleServerAppError"
import { handleServerNetworkError } from "common/utils/handleServerNetworkError"
import { RequestStatus, setAppStatus } from "../../../app/app-reducer"
import { _todolistsApi } from "../api/todolistsApi"
import { Todolist } from "../api/todolistsApi.types"
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"

export type FilterValuesType = "all" | "active" | "completed"

export type DomainTodolist = Todolist & {
  filter: FilterValuesType
  entityStatus: RequestStatus
}

const initialState: DomainTodolist[] = []

const createSliceWithThunks = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })

const todolistsSlice = createSliceWithThunks({
  name: "todolists",
  initialState,
  reducers: (create) => {
    const createAThunk = create.asyncThunk.withTypes<{ rejectValue: null }>()
    return {
      changeTodolistFilter: create.reducer<{ id: string; filter: FilterValuesType }>((state, action) => {
        const index = state.findIndex((tl) => tl.id === action.payload.id)
        if (index !== -1) state[index].filter = action.payload.filter
      }),
      changeTodolistEntityStatus: create.reducer<{ id: string; entityStatus: RequestStatus }>((state, action) => {
        const index = state.findIndex((tl) => tl.id === action.payload.id)
        if (index !== -1) state[index].entityStatus = action.payload.entityStatus
      }),
      fetchTodolists: createAThunk(
        async (undefined, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await _todolistsApi.getTodolists()
            dispatch(setAppStatus({ status: "succeeded" }))
            return res.data
          } catch (error: any) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
          }
        },
        {
          fulfilled: (state, action) => {
            return action.payload.map((tl) => ({ ...tl, entityStatus: "idle", filter: "all" }))
          },
        },
      ),
      addTodolist: createAThunk(
        async (title: string, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await _todolistsApi.createTodolist(title)
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              return { todolist: res.data.data.item }
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
            state.unshift({ ...action.payload.todolist, filter: "all", entityStatus: "idle" })
          },
        },
      ),
      removeTodolist: createAThunk(
        async (id: string, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            dispatch(changeTodolistEntityStatus({ id, entityStatus: "loading" }))
            const res = await _todolistsApi.deleteTodolist(id)
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              return { id }
            } else {
              handleServerAppError(res.data, dispatch)
              return rejectWithValue(null)
            }
          } catch (error: any) {
            dispatch(changeTodolistEntityStatus({ id, entityStatus: "failed" }))
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
          }
        },
        {
          fulfilled: (state, action) => {
            const index = state.findIndex((tl) => tl.id === action.payload.id)
            if (index !== -1) {
              state.splice(index, 1)
            }
          },
        },
      ),
      updateTodolistTitle: createAThunk(
        async (arg: { id: string; title: string }, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await _todolistsApi.updateTodolist(arg)
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              return arg
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
            const index = state.findIndex((tl) => tl.id === action.payload.id)
            if (index !== -1) state[index].title = action.payload.title
          },
        },
      ),
    }
  },
  extraReducers: (builder) =>
    builder.addCase(clearTasksAndTodolists, (state, action) => {
      return action.payload.todolists
    }),
  selectors: {
    selectTodolists: (state) => state,
  },
})

export const {
  changeTodolistEntityStatus,
  addTodolist,
  changeTodolistFilter,
  updateTodolistTitle,
  fetchTodolists,
  removeTodolist,
} = todolistsSlice.actions

export const { selectTodolists } = todolistsSlice.selectors

export default todolistsSlice.reducer
