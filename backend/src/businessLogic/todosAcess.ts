import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly doClient: DocumentClient = createDynamoDBClient(),
    private readonly Table-todos = process.env.TODOS_TABLE
  ) {}

  /**
   * Method to get all todos from database
   * @param userId, id of user gotten from auth token
   * @return a list of TodoItems
   */
  async function getUserTodosById(userId: string): Promise<TodoItem[]> {
    logger.info(`Querying database for all todos by user ${userId}`)
    const params = {
      TableName: this.Table-todos,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }
    const userTodos = await this.doClient.query(params).promise()
    return userTodos.item as TodoItem[]
  }

  /**
   * Create a new Todo
   * @param TodoItem object
   * @return TodItem
   */
  async function createTodo(newTodo: TodoItem): Promise<TodoItem> {
     logger.info(`Inserting a new todo data ${newTodo}`)
     await this.doClient.put({
	TableName: this.Table-todos,
	Item: newTodo
     }).promise()
     return newTodo as TodoItem
  }

  /**
   * Updates a todo item
   * @param userId
   * @param todoId
   * @param updates, an object of new data to be updated
   */
  async function updateTodoById(userId: string, todoId: string, updates: TodoUpdate): Promise<boolean> {
    const todoExists = await this.exists(userId, todoId)
    if (!todoExists)
	return false
    logger.info(`Updating todo with id ${todoId} with ${updates}`)
    const {name, dueDate, done} = updates
    const params = {
      TableName: this.Table-todos,
      Key: {userId, todoId},
      UpdateExpression: 'set #n = :n, #d = :d, #dd = :dd',
      ExpressionAttributeNames: {
	'#n' : 'name', '#d' : 'done', '#dd' : 'dueDate'
      }
      ExpressionAttributeValues: {
	':n' : name, ':d' : done, ':dd' : dueDate
      }
    }
    const data = await this.doClient.update(params).promise()
    return data ? true : false
  }

  /**
   * Deletes a todo item
   * @param userId
   * @param todoId
   */
  async function deleteTodoById(userId: string, todoId, string): Promise<boolean> {
    const todoExists = await this.exists(userId, todoId)
    if (!todoExists)
      return false
    logger.info(`Deleting todo with id ${todoId} owned by ${userId}`)
    const params = {
      TableName: this.Table-todos,
      Key: {userId, todoId},
    }
    const deleted = await this.doClient.delete(params).promise()
    return deleted ? true : false
  }

  /**
   * Updates todo item with image attachment
   * @param userId
   * @param todoId
   * @param imageUrl
   * @return boolean
   */
  async function updateTodoAttachment(userId: string, todoId: string, imageUrl: string): Promise<boolean> {
    const todoExists = await this.exists(userId, todoId)
    if (!todoExists)
      return false
    logger.info(`Updating attachment for todo ${todoId} owned by ${userId}`)
    const params = {
      TableName: this.Table-todos,
      Key: {userId, todoId},
      UpdateExpression: 'set attachmentUrl = :atturl'
      ExpressionAttributeValues: {
	':atturl': imageUrl
      }
    }
    const attachmentUpdated = await this.doClient.update(params).promise()
    return attachmentUpdated ? true : false
  }

  /**
   * Checks if a todo exist for a particular user id
   * @param userId
   * @param todoId
   * @return boolean, true if it exists else false
   */
  static async function exists(userId: string, todoId: string): <boolean> {
    logger.info(`Checking if todo with id ${todoId} exist for user ${userId}`)
    const params = {
      TableName: this.Table-todos,
      Key: {userId, todoId}
    }
    const todo = await this.doClient.get(params).promise()
    return !!todo.item
  }
}

/**
 * Create a database client
 */
function createDynamoDBClient() => {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
