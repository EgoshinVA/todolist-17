import { RequestStatus } from "../../../app/app-reducer"
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
    }
  },
  extraReducers: (builder) =>
    builder.addCase(clearTasksAndTodolists, (state, action) => {
      return action.payload.todolists
    })
})

export const { changeTodolistFilter } = todolistsSlice.actions

export default todolistsSlice.reducer
