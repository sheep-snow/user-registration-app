import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import Stripe from 'stripe';
import { getUserFromContext } from './auth-utils';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

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

    // Check if user exists, create if not
    let userRecord;
    try {
      const result = await dynamoClient.send(new GetCommand({
        TableName: process.env.USERS_TABLE!,
        Key: { userId: user.userId }
      }));
      userRecord = result.Item;
    } catch (error) {
      console.error('Error getting user:', error);
    }

    let customerId = userRecord?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.userId }
      });
      customerId = customer.id;

      await dynamoClient.send(new PutCommand({
        TableName: process.env.USERS_TABLE!,
        Item: {
          userId: user.userId,
          stripeCustomerId: customerId,
          email: user.email,
          name: user.name,
          createdAt: new Date().toISOString()
        }
      }));
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      customer: customerId,
      metadata: { userId: user.userId }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret
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