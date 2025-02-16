import List from "@mui/material/List"
import { TaskStatus } from "common/enums"
import { Task } from "./Task/Task"
import { useGetTasksQuery } from "../../../../api/tasksApi"
import { DomainTodolist } from "../../../../api/todolistsApi.types"
import { TasksSkeleton } from "../../skeletons/TasksSkeleton/TasksSkeleton"

type Props = {
  todolist: DomainTodolist
}

export const Tasks = ({ todolist }: Props) => {
  const {data, isLoading} = useGetTasksQuery(todolist.id)

  if (isLoading) {
    return <TasksSkeleton />
  }

  let allTodolistTasks = data?.items

  if (todolist.filter === "active") {
    allTodolistTasks = allTodolistTasks?.filter((task) => task.status === TaskStatus.New)
  }

  if (todolist.filter === "completed") {
    allTodolistTasks = allTodolistTasks?.filter((task) => task.status === TaskStatus.Completed)
  }

  return (
    <>
      {allTodolistTasks?.length === 0 ? (
        <p>Тасок нет</p>
      ) : (
        <List>
          {allTodolistTasks?.map((task) => {
            return <Task key={task.id} task={task} todolist={todolist} />
          })}
        </List>
      )}
    </>
  )
}
