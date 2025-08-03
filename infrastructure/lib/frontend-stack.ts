import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

interface FrontendStackProps extends cdk.StackProps {
  appName: string;
  environment: string;
  domainName: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { appName, environment, domainName } = props;

    // S3バケット（CloudFront経由でのみアクセス）
    this.bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `${appName}-frontend-${environment}-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 既存のRoute53ホストゾーンを参照
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: domainName,
    });

    // SSL証明書（ACM）- CloudFront用はus-east-1で作成必要
    const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: domainName,
      hostedZone: hostedZone,
      region: 'us-east-1',
    });

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
      },
      domainNames: [domainName],
      certificate: certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // Route53 Aレコード
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this.distribution)
      ),
    });

    // 出力
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'Frontend S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });

    new cdk.CfnOutput(this, 'HostedZoneId', {
      value: hostedZone.hostedZoneId,
      description: 'Route53 Hosted Zone ID',
    });

    new cdk.CfnOutput(this, 'DomainName', {
      value: domainName,
      description: 'Custom Domain Name',
    });
  }
}