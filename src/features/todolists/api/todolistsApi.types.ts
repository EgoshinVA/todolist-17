import { RequestStatus } from "../../../app/appSlice"

export type Todolist = {
  id: string
  title: string
  addedDate: string
  order: number
}
export type FilterValuesType = "all" | "active" | "completed"
export type DomainTodolist = Todolist & {
  filter: FilterValuesType
  entityStatus: RequestStatus
}