## make real on Amazon Bedrock (Anthropic Claude v3)

This is a project to generate web frontend code from a freehand diagram using Amazon Bedrock with the foundation model Anthropic Claude v3.

## Deploy
You can use [AWS CDK](https://aws.amazon.com/cdk/) to deploy this project.

First you have to configure CDK parameters in [`cdk/bin/cdk.ts`](cdk/bin/cdk.ts). Set `hostedZoneId` and `zoneName` with your Route 53 hosted zone.

Then run the following command:

```sh
cd cdk
npm ci
npx cdk deploy --all
```

The deployment completes in 10 minutes. After a successful deployment, you can access the URL shown in the stack output:

```
Outputs:
MakeRealStack.WebAppCloudFrontUrlBAD6B277 = https://www.example.com
```

## License
Check the license of [tldraw](https://github.com/tldraw/tldraw). You have to use this app for non-commercial purpose.

## Links
* [the original project](https://github.com/tldraw/make-real)

