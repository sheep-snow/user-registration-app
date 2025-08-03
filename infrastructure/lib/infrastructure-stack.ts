import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'Users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const licensesTable = new dynamodb.Table(this, 'LicensesTable', {
      tableName: 'Licenses',
      partitionKey: { name: 'licenseId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    licensesTable.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'user-registration-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      removalPolicy: RemovalPolicy.DESTROY
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: true
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: ['http://localhost:4321/auth/callback']
      }
    });

    // Lambda Functions
    const createPaymentSessionFunction = new lambda.Function(this, 'CreatePaymentSession', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Payment session creation placeholder' })
          };
        };
      `)
    });

    const getLicensesFunction = new lambda.Function(this, 'GetLicenses', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            body: JSON.stringify({ licenses: [] })
          };
        };
      `)
    });

    const stripeWebhookFunction = new lambda.Function(this, 'StripeWebhook', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
          };
        };
      `)
    });

    // Grant DynamoDB permissions
    usersTable.grantReadWriteData(createPaymentSessionFunction);
    licensesTable.grantReadWriteData(getLicensesFunction);
    licensesTable.grantReadWriteData(stripeWebhookFunction);
    usersTable.grantReadWriteData(stripeWebhookFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'UserRegistrationApi', {
      restApiName: 'User Registration API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool]
    });

    // API Routes
    const paymentResource = api.root.addResource('payment');
    paymentResource.addResource('create-session').addMethod('POST', 
      new apigateway.LambdaIntegration(createPaymentSessionFunction),
      { authorizer }
    );

    const licensesResource = api.root.addResource('licenses');
    licensesResource.addMethod('GET', 
      new apigateway.LambdaIntegration(getLicensesFunction),
      { authorizer }
    );

    const webhookResource = api.root.addResource('webhook');
    webhookResource.addResource('stripe').addMethod('POST', 
      new apigateway.LambdaIntegration(stripeWebhookFunction)
    );
  }
}
