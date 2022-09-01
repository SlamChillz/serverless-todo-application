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

  /*
   * Method to get all todos from database
   */
  getUserTodosById: Promise<TodoItem[]> = async (userId: string) => {
    logger.info(`Querying database for all todos by user ${userId}`)
    const params: object = {
      TableName: this.Table-todos,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }
    const userTodos = await this.doClient.query(params).promise()
    return (userTodos.item) as TodoItem[]
  }
}

/**
 * Create a database client
 */
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
