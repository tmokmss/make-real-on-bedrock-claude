import * as cdk from 'aws-cdk-lib'
import {
	Certificate,
	CertificateValidation,
	ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

interface CertStackProps extends cdk.StackProps {
	zoneName: string
	hostedZoneId: string
}

export class CertStack extends cdk.Stack {
	public readonly certificate: ICertificate

	constructor(scope: Construct, id: string, props: CertStackProps) {
		super(scope, id, props)

		const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
			zoneName: props.zoneName,
			hostedZoneId: props.hostedZoneId,
		})

		const cert = new Certificate(this, 'Certificate', {
			domainName: `*.${hostedZone.zoneName}`,
			validation: CertificateValidation.fromDns(hostedZone),
		})

		this.certificate = cert
	}
}
