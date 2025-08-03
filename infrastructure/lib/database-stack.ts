import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { CommonResourceStack } from './common-resource-stack';

export class DatabaseStack extends Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly licensesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, common: CommonResourceStack, props?: StackProps) {
    super(scope, id, props);

    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `${common.appName}-Users-${common.stage}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    this.licensesTable = new dynamodb.Table(this, 'LicensesTable', {
      tableName: `${common.appName}-Licenses-${common.stage}`,
      partitionKey: { name: 'licenseId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    this.licensesTable.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
    });
  }
}