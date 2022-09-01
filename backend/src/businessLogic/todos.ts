import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()

/**
 * Get todos for a single user by Id
 */
getTodosForUser: Promise<TodoItem[]> = async (userId: string) => {
	logger.info(`Getting todo lists for user with id: ${userId}`)
	const todos = await todoAccess.getUserTodosById(userId)
	return (todos)
}
