import { CfnOutput, Duration, IgnoreMode, Stack } from 'aws-cdk-lib'
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
	AllowedMethods,
	CachePolicy,
	Distribution,
	Function,
	FunctionCode,
	FunctionEventType,
	OriginRequestPolicy,
	ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { ITable } from 'aws-cdk-lib/aws-dynamodb'
import { Platform } from 'aws-cdk-lib/aws-ecr-assets'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda'
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'
import { readFileSync } from 'fs'
import { join } from 'path'

export interface WebAppProps {
	table: ITable
	hostedZone: IHostedZone
	certificate: ICertificate
	basicAuthUsername: string
	basicAuthPassword: string
}

export class WebApp extends Construct {
	constructor(scope: Construct, id: string, props: WebAppProps) {
		super(scope, id)

		const { table, hostedZone } = props

		const handler = new DockerImageFunction(this, 'Handler', {
			code: DockerImageCode.fromImageAsset(join('..'), {
				file: 'Dockerfile',
				platform: Platform.LINUX_AMD64,
				ignoreMode: IgnoreMode.DOCKER,
				exclude: readFileSync('../.dockerignore').toString().split('\n'),
				buildArgs: {
					BUILD_ENV: 'production',
					APP_HOST: `www.${hostedZone.zoneName}`,
					LINK_HOST: `link.${hostedZone.zoneName}`,
				},
			}),
			timeout: Duration.seconds(30),
			environment: {
				TABLE_NAME: table.tableName,
			},
			memorySize: 512,
			// architecture: Architecture.ARM_64,
		})
		table.grantReadWriteData(handler)
		handler.addToRolePolicy(
			new PolicyStatement({
				actions: ['bedrock:InvokeModel'],
				resources: ['*'],
			})
		)

		const integration = new HttpLambdaIntegration('Integration', handler, {})

		const api = new HttpApi(this, 'Api', {})
		api.addRoutes({
			path: '/{proxy+}',
			integration,
		})

		const cachedPathPatterns = ['/_next/static/*', '/favicon.svg']
		const origin = new HttpOrigin(
			`${api.apiId}.execute-api.${Stack.of(this).region}.amazonaws.com`,
			{
				customHeaders: {
					'X-Forwarded-Host': `www.${hostedZone.zoneName}`,
				},
			}
		)

		const basicAuthFunction = new Function(this, 'BasicAuthFunction', {
			functionName: `basic-authentication`,
			code: FunctionCode.fromInline(
				readFileSync(join(__dirname, 'cff', 'basic-auth.js'))
					.toString()
					.replace(
						'<BASIC>',
						Buffer.from(`${props.basicAuthUsername}:${props.basicAuthPassword}`).toString('base64')
					)
			),
		})

		const distribution = new Distribution(this, 'Distribution', {
			defaultBehavior: {
				origin,
				cachePolicy: CachePolicy.CACHING_DISABLED,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html#add-origin-custom-headers-forward-authorization
				originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
				allowedMethods: AllowedMethods.ALLOW_ALL,
				functionAssociations: [
					{
						eventType: FunctionEventType.VIEWER_REQUEST,
						function: basicAuthFunction,
					},
				],
			},
			certificate: props.certificate,
			domainNames: [`www.${hostedZone.zoneName}`],
			additionalBehaviors: {
				...Object.fromEntries(
					cachedPathPatterns.map((pathPattern) => [
						pathPattern,
						{
							origin,
							cachePolicy: CachePolicy.CACHING_OPTIMIZED,
							viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
							originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
							allowedMethods: AllowedMethods.ALLOW_ALL,
							functionAssociations: [
								{
									eventType: FunctionEventType.VIEWER_REQUEST,
									function: basicAuthFunction,
								},
							],
						},
					])
				),
			},
		})

		const linkDistribution = new Distribution(this, 'LinkDistribution', {
			defaultBehavior: {
				origin: new HttpOrigin(`${api.apiId}.execute-api.${Stack.of(this).region}.amazonaws.com`, {
					customHeaders: {
						'X-Forwarded-Host': `link.${hostedZone.zoneName}`,
					},
				}),
				cachePolicy: CachePolicy.CACHING_OPTIMIZED,
				viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html#add-origin-custom-headers-forward-authorization
				originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
				allowedMethods: AllowedMethods.ALLOW_ALL,
			},
			certificate: props.certificate,
			domainNames: [`link.${hostedZone.zoneName}`],
		})
		new ARecord(this, 'MainRecord', {
			zone: props.hostedZone,
			target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
			recordName: 'www',
		})

		new ARecord(this, 'LinkRecord', {
			zone: props.hostedZone,
			target: RecordTarget.fromAlias(new CloudFrontTarget(linkDistribution)),
			recordName: 'link',
		})

		// new CfnOutput(this, 'HttpApiUrl', { value: api.url! })
		new CfnOutput(this, 'CloudFrontUrl', { value: `https://www.${hostedZone.zoneName}` })
	}
}
