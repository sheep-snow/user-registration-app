import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const sig = event.headers['stripe-signature'];
    if (!sig) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing stripe signature' })
      };
    }

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body!,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    if (stripeEvent.type === 'payment_intent.succeeded') {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
      const userId = paymentIntent.metadata.userId;

      if (userId) {
        const licenseId = uuidv4();
        const licenseCode = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        await dynamoClient.send(new PutCommand({
          TableName: process.env.LICENSES_TABLE!,
          Item: {
            licenseId,
            userId,
            licenseCode,
            purchaseDate: new Date().toISOString(),
            paymentIntentId: paymentIntent.id
          }
        }));

        console.log(`License created: ${licenseCode} for user: ${userId}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};