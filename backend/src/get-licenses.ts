import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getUserFromContext } from './auth-utils';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = getUserFromContext(event);
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const result = await dynamoClient.send(new QueryCommand({
      TableName: process.env.LICENSES_TABLE!,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user.userId
      }
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      },
      body: JSON.stringify({
        licenses: result.Items || []
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};