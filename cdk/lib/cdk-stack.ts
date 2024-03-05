import * as cdk from 'aws-cdk-lib'
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { AttributeType, Billing, TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import { WebApp } from './constructs/webapp'

interface CdkStackProps extends cdk.StackProps {
	certificate: ICertificate

	zoneName: string
	hostedZoneId: string
}

export class CdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: CdkStackProps) {
		super(scope, id, props)

		const table = new TableV2(this, 'LinkTable', {
			partitionKey: {
				name: 'PK',
				type: AttributeType.STRING,
			},
			billing: Billing.onDemand(),
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		})

		const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
			zoneName: props.zoneName,
			hostedZoneId: props.hostedZoneId,
		})

		new WebApp(this, 'WebApp', { table, hostedZone, certificate: props.certificate })
	}
}
