import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { CommonResourceStack } from './common-resource-stack';

export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, common: CommonResourceStack, props?: StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${common.appName}-pool-${common.stage}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      removalPolicy: RemovalPolicy.DESTROY
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        userSrp: true,
        userPassword: true
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: [common.frontendCallbackUrl]
      }
    });
  }
}