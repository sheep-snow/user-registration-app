import { Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';
import { CommonResourceStack } from './common-resource-stack';
import { AuthStack } from './auth-stack';
import { DatabaseStack } from './database-stack';

export class ApiStack extends Stack {
  public readonly api: apigateway.RestApi;

  constructor(
    scope: Construct, 
    id: string, 
    common: CommonResourceStack,
    auth: AuthStack,
    database: DatabaseStack,
    props?: StackProps
  ) {
    super(scope, id, props);

    // Lambda Functions with Docker
    const createPaymentSessionFunction = new lambda.DockerImageFunction(this, 'CreatePaymentSession', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../backend'), {
        cmd: ['create-payment-session.handler']
      }),
      environment: {
        USERS_TABLE: database.usersTable.tableName,
        STRIPE_SECRET_KEY: common.stripeSecretKey,
        COGNITO_USER_POOL_ID: auth.userPool.userPoolId,
        COGNITO_CLIENT_ID: auth.userPoolClient.userPoolClientId,
        LOG_LEVEL: common.logLevel
      }
    });

    const getLicensesFunction = new lambda.DockerImageFunction(this, 'GetLicenses', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../backend'), {
        cmd: ['get-licenses.handler']
      }),
      environment: {
        LICENSES_TABLE: database.licensesTable.tableName,
        COGNITO_USER_POOL_ID: auth.userPool.userPoolId,
        COGNITO_CLIENT_ID: auth.userPoolClient.userPoolClientId,
        LOG_LEVEL: common.logLevel
      }
    });

    const stripeWebhookFunction = new lambda.DockerImageFunction(this, 'StripeWebhook', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../backend'), {
        cmd: ['stripe-webhook.handler']
      }),
      environment: {
        USERS_TABLE: database.usersTable.tableName,
        LICENSES_TABLE: database.licensesTable.tableName,
        STRIPE_WEBHOOK_SECRET: common.stripeWebhookSecret,
        LOG_LEVEL: common.logLevel
      }
    });

    // Grant DynamoDB permissions
    database.usersTable.grantReadWriteData(createPaymentSessionFunction);
    database.licensesTable.grantReadWriteData(getLicensesFunction);
    database.licensesTable.grantReadWriteData(stripeWebhookFunction);
    database.usersTable.grantReadWriteData(stripeWebhookFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'UserRegistrationApi', {
      restApiName: `${common.appName}-api-${common.stage}`,
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:4321',
          common.frontendDomain
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [auth.userPool]
    });

    // API Routes
    const paymentResource = this.api.root.addResource('payment');
    paymentResource.addResource('create-session').addMethod('POST', 
      new apigateway.LambdaIntegration(createPaymentSessionFunction),
      { authorizer }
    );

    const licensesResource = this.api.root.addResource('licenses');
    licensesResource.addMethod('GET', 
      new apigateway.LambdaIntegration(getLicensesFunction),
      { authorizer }
    );

    const webhookResource = this.api.root.addResource('webhook');
    webhookResource.addResource('stripe').addMethod('POST', 
      new apigateway.LambdaIntegration(stripeWebhookFunction)
    );
  }
}