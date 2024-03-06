#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { CdkStack } from '../lib/cdk-stack'
import { CertStack } from '../lib/cert-stack'

const app = new cdk.App()

// This app requires a Route53 hosted zone, created outside of this project beforehand.
// After creating one, provide the hosted zone id here
const hostedZoneId = 'Z0XXXXXXXXXXXXXXXXXXX'

// Also provide the zone name (domain) of the hosted zone here (e.g. example.com)
const zoneName = 'example.com'

const basicAuthUsername = 'admin'
const basicAuthPassword = 'passw0rd'

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
	basicAuthUsername,
	basicAuthPassword,
})
