import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { NextRequest } from 'next/server'

const client = new BedrockRuntimeClient({ region: 'us-west-2' })

type RequestData = {
	systemPrompt: string
	messages: any
}

export async function POST(req: NextRequest) {
	const data = (await req.json()) as RequestData
	const resp = await client.send(
		new InvokeModelCommand({
			modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
			accept: 'application/json',
			contentType: 'application/json',
			body: JSON.stringify({
				anthropic_version: 'bedrock-2023-05-31',
				max_tokens: 4096,
				temperature: 0.5,
				system: data.systemPrompt,
				messages: data.messages,
			}),
		})
	)
	return new Response(Buffer.from(resp.body).toString(), {
		headers: {
			'content-type': 'applicaton/json',
		},
	})
}
