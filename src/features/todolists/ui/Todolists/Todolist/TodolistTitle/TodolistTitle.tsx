import DeleteIcon from "@mui/icons-material/Delete"
import IconButton from "@mui/material/IconButton"
import { EditableSpan } from "common/components"
import { DomainTodolist } from "../../../../model/todolists-reducer"
import s from "./TodolistTitle.module.css"
import { useRemoveTodolistMutation, useUpdateTodolistTitleMutation } from "../../../../api/todolistsApi"

type Props = {
  todolist: DomainTodolist
}

export const TodolistTitle = ({ todolist }: Props) => {
  const { title, id, entityStatus } = todolist

  const [removeTodolist] = useRemoveTodolistMutation()
  const [updateTodolist] = useUpdateTodolistTitleMutation()

  const removeTodolistHandler = () => {
    removeTodolist(id)
  }
  const updateTodolistHandler = (title: string) => {
    updateTodolist({ id, title })
  }

  return (
    <div className={s.container}>
      <h3>
        <EditableSpan value={title} onChange={updateTodolistHandler} disabled={entityStatus === "loading"} />
      </h3>
      <IconButton onClick={removeTodolistHandler} disabled={entityStatus === "loading"}>
        <DeleteIcon />
      </IconButton>
    </div>
  )
}
