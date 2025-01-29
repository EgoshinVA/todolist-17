import { ResultCode } from "common/enums"
import { handleServerAppError } from "common/utils/handleServerAppError"
import { handleServerNetworkError } from "common/utils/handleServerNetworkError"
import { setAppError, setAppStatus } from "../../../app/app-reducer"
import { RootState } from "../../../app/store"
import { tasksApi } from "../api/tasksApi"
import { DomainTask, UpdateTaskDomainModel, UpdateTaskModel } from "../api/tasksApi.types"
import { addTodolist, removeTodolist } from "./todolists-reducer"
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"

export type TasksStateType = {
  [key: string]: DomainTask[]
}

const initialState: TasksStateType = {}

const createSliceWithThunks = buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })

const tasksSlice = createSliceWithThunks({
  name: "tasks",
  initialState,
  reducers: (create) => {
    const createAThunk = create.asyncThunk.withTypes<{ rejectValue: null }>()
    return {
      fetchTasks: createAThunk(
        async (todolistId: string, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await tasksApi.getTasks(todolistId)
            dispatch(setAppStatus({ status: "succeeded" }))
            return { todolistId, tasks: res.data.items }
          } catch (error: any) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(error)
          }
        },
        {
          fulfilled: (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
          },
        },
      ),
      removeTask: createAThunk(
        async (arg: { taskId: string; todolistId: string }, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await tasksApi.deleteTask(arg)
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              return arg
            } else {
              handleServerAppError(res.data, dispatch)
            }
            return rejectWithValue(null)
          } catch (error: any) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
          }
        },
        {
          fulfilled: (state, action) => {
            state[action.payload.todolistId] = state[action.payload.todolistId].filter(
              (ts) => ts.id !== action.payload.taskId,
            )
          },
        },
      ),
      addTask: createAThunk(
        async (arg: { title: string; todolistId: string }, { dispatch, rejectWithValue }) => {
          try {
            dispatch(setAppStatus({ status: "loading" }))
            const res = await tasksApi.createTask(arg)
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatus({ status: "succeeded" }))
              return { task: res.data.data.item }
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
            state[action.payload.task.todoListId].unshift(action.payload.task)
          },
        },
      ),
      updateTask: createAThunk(
        async (
          arg: {
            taskId: string
            todolistId: string
            domainModel: UpdateTaskDomainModel
          },
          { dispatch, getState, rejectWithValue },
        ) => {
          {
            try {
              const { taskId, todolistId, domainModel } = arg

              const allTasksFromState = (getState() as RootState).tasks
              const tasksForCurrentTodolist = allTasksFromState[todolistId]
              const task = tasksForCurrentTodolist.find((t) => t.id === taskId)

              if (!task) {
                dispatch(setAppError({ error: "Task not found" }))
                return rejectWithValue(null)
              }

              const model: UpdateTaskModel = {
                status: task.status,
                title: task.title,
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                ...domainModel,
              }

              dispatch(setAppStatus({ status: "loading" }))

              const res = await tasksApi.updateTask({ taskId, todolistId, model })

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
          }
        },
        {
          fulfilled: (state, action) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex((t) => t.id === action.payload.taskId)
            if (index !== -1) {
              tasks[index] = { ...tasks[index], ...action.payload.domainModel }
            }
          },
        },
      ),
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(clearTasksAndTodolists, (state, action) => {
        return action.payload.tasks
      })
  },
  selectors: {
    selectTasks: (state) => state,
  },
})

export const { addTask, removeTask, updateTask, fetchTasks } = tasksSlice.actions
export const { selectTasks } = tasksSlice.selectors

export default tasksSlice.reducer
