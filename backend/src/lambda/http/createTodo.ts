import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { createLogger } from ../../utils/logger
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

const logger = createLogger('CreateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing new todo creation from event:-> ${event}`)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const userId: string = getUserId(event)
    const newTodoData = await createTodo(userId, newTodo)
    delete newTodoData.userId
    return {
	    statusCode: 201,
	    header: {
		    'Access-Control-Origin-Allow': "*"
	    },
	    body: {
		    item: JSON.stringify(newTodoData)
	    }
    }
)

handler.use(
  cors({
    credentials: true
  })
)
