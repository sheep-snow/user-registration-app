#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Environment } from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import 'source-map-support/register';
import { CommonResourceStack } from '../lib/common-resource-stack';
import { AuthStack } from '../lib/auth-stack';
import { ApiStack } from '../lib/api-stack';
import { DatabaseStack } from '../lib/database-stack';
import { FrontendStack } from '../lib/frontend-stack';

dotenv.config({ path: './cdk.env' });

if (!process.env.APP_NAME) {
  throw new Error('Please set APP_NAME in cdk.env file');
}

const app = new cdk.App();
const VALID_STAGES = ['dev', 'prod'];
const stage = app.node.tryGetContext('env');

if (!VALID_STAGES.includes(stage)) {
  throw new Error('Please specify the context. i.e. `--context env=dev|prod`');
}

const env: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const appName = process.env.APP_NAME;

const common = new CommonResourceStack(app, `${appName}-CommonResourceStack-${stage}`, {
  env,
  stage,
  appName,
  contextJson: process.env,
});

const database = new DatabaseStack(app, `${appName}-DatabaseStack-${stage}`, common, { env });
const auth = new AuthStack(app, `${appName}-AuthStack-${stage}`, common, { env });
const api = new ApiStack(app, `${appName}-ApiStack-${stage}`, common, auth, database, { env });
const frontend = new FrontendStack(app, `${appName}-FrontendStack-${stage}`, {
  env,
  appName,
  environment: stage,
  domainName: process.env.DOMAIN_NAME || `app-${stage}.yourdomain.com`,
});

cdk.Tags.of(app).add('Application', appName);
cdk.Tags.of(app).add('Stage', stage);

app.synth();