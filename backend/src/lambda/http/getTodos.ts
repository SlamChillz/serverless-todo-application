import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
const logger = createLogger('getUserTodosById')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info(`Handling: 'GET todos by user id event', details:->\n ${event}`)
    const userId: string = getUserId(event)
    const todos = await getTodosForUser(userId)
    return {
	    statusCode: 200,
	    headers: {
		    'Access-Control-Allow-Origin': "*",
	    }
	    body: JSON.stringify({
		    items: todos
	    })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
  cors({
    credentials: true
  })
)
