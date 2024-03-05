import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { NextRequest } from 'next/server'

const ddb = new DynamoDBClient({})
const client = DynamoDBDocumentClient.from(ddb)
const TableName = process.env.TABLE_NAME ?? 'test-table'

type RequestData = {
	linkId: string
}

export async function POST(req: NextRequest) {
	const data = (await req.json()) as RequestData
	const resp = await client.send(
		new GetCommand({
			Key: {
				PK: data.linkId,
			},
			TableName,
		})
	)
	return Response.json({
		html: resp.Item.html,
	})
}
