import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('Todos')
const todoAccess = new TodosAccess()
const imagesBucketName = process.env.ATTACHMENT_S3_BUCKET

/**
 * Get todos for a single user by Id
 * @param userId, id of user gotten from auth header token
 * @return a list of todos by user with given id
 */
export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  logger.info(`Getting todo lists for user with id: ${userId}`)
  const todos = await todoAccess.getUserTodosById(userId)
  return todos as TodoItem[]
}

/**
 * Create a new todo Item
 * @param userId, id of user gotten from auth header token
 * @param newTask, contains name and due date of task
 * @return TodoItem, an object of new todo details
 */
export const createTodo = async (
  userId: string,
  newTodoRequest: CreateTodoRequest
): Promise<TodoItem> => {
  logger.info(`Creating new todo for user ${userId}`)
  const { name: string, dueDate: string } = newTodoRequest
  const todoId: string = uuid.v4()
  const createdAt: string = new Date().toISOString()
  let newTodo: TodoItem = {
    userId,
    todoId,
    createdAt,
    name,
    dueDate: new Date(dueDate).toISOString(),
    done: false,
    attachmentUrl: ''
  }
  newTodo = await todoAccess.createTodo(newItem)
  return newTodo as TodoItem
}

/**
 * Updates an existing todo
 * @param userId
 * @param todoId
 * @param updateData
 */
export const updateTodo = async (
  userId: string,
  todoId: string,
  updateData: updateTodorequest
): Promise<boolean> => {
  logger.info(`Calling update for user ${userId} on todo ${todoId}`)
  return await todoAccess.updateTodoById(userId, todoId, updateData)
}

/**
 * Deletes an exiting todo
 * @param userId
 * @param todoId
 */
export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<boolean> => {
  logger.info(`Calling delete for user ${userId} on todo ${todoId}`)
  return await todoAccess.deleteTodoById(userId, todoId)
}

/**
 * Adds image attachment to an existing todo item
 * @param userId
 * @param todoId
 */
export const createAttachmentPresignedUrl = async (
  userId: string,
  todoId: string
): Promise<boolean> => {
  logger.info(`Updating attachment url for todo ${todoId} owned by ${userId}`)
  const imageId = `${userId}-${todoId}`
  const imageUrl = `https://${imagesBucketName}.s3.amazonaws.com/${imageId}`
  const attached = await todoAccess.updateTodoAttachment(
    userId,
    todoId,
    imageUrl
  )
  if (attached) {
    return await AttachmentUtils(imageUrl)
  }
  return null
}
