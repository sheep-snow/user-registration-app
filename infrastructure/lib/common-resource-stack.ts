import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface CommonResourceStackProps extends StackProps {
  stage: string;
  appName: string;
  contextJson: any;
}

export class CommonResourceStack extends Stack {
  public readonly stage: string;
  public readonly appName: string;
  public readonly googleClientId: string;
  public readonly googleClientSecret: string;
  public readonly stripeSecretKey: string;
  public readonly stripeWebhookSecret: string;
  public readonly frontendCallbackUrl: string;
  public readonly frontendDomain: string;
  public readonly logLevel: string;

  constructor(scope: Construct, id: string, props: CommonResourceStackProps) {
    super(scope, id, props);

    this.stage = props.stage;
    this.appName = props.appName;
    this.googleClientId = props.contextJson.GOOGLE_CLIENT_ID || '';
    this.googleClientSecret = props.contextJson.GOOGLE_CLIENT_SECRET || '';
    this.stripeSecretKey = props.contextJson.STRIPE_SECRET_KEY || '';
    this.stripeWebhookSecret = props.contextJson.STRIPE_WEBHOOK_SECRET || '';
    this.frontendCallbackUrl = props.contextJson.FRONTEND_CALLBACK_URL || 'http://localhost:4321/auth/callback';
    this.frontendDomain = props.contextJson.FRONTEND_DOMAIN || 'http://localhost:4321';
    this.logLevel = props.contextJson.LOGLEVEL || 'INFO';
  }
}