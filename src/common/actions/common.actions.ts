import { createAction } from "@reduxjs/toolkit"
import { DomainTodolist } from "../../features/todolists/model/todolists-reducer"
import { TasksStateType } from "../../features/todolists/model/tasks-reducer"

export const clearTasksAndTodolists = createAction(
  "common/clear-tasks-todolists",
  (tasks: TasksStateType, todolists: DomainTodolist[]) => {
    return {
      payload: {
        tasks,
        todolists
      },
    }
  },
)