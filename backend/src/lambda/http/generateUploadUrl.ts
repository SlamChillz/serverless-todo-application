import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    const uploadUrl = await createAttachmentPresignedUrl(userId, todoId)
    return {
      statusCode: uploadUrl ? 201 : 400,
      header: {
	'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({uploadUrl})
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
