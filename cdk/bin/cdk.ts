#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { CdkStack } from '../lib/cdk-stack'
import { CertStack } from '../lib/cert-stack'

const app = new cdk.App()

const zoneName = 'TODO' 
const hostedZoneId = 'TODO'

const certStack = new CertStack(app, 'MakeRealCertStack', {
	env: {
		region: 'us-east-1',
	},
	crossRegionReferences: true,
	zoneName,
	hostedZoneId,
})

new CdkStack(app, 'MakeRealStack', {
	env: {
		// must explicitly set region when using cross region reference feature
		region: process.env.CDK_DEFAULT_REGION,
	},
	crossRegionReferences: true,
	certificate: certStack.certificate,
	zoneName,
	hostedZoneId,
})
