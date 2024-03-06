'use server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const ddb = new DynamoDBClient({})
const client = DynamoDBDocumentClient.from(ddb)
const TableName = process.env.TABLE_NAME ?? 'test-table'

export async function uploadLink(shapeId: string, html: string) {
	if (typeof shapeId !== 'string' || !shapeId.startsWith('shape:')) {
		throw new Error('shapeId must be a string starting with shape:')
	}
	if (typeof html !== 'string') {
		throw new Error('html must be a string')
	}

	shapeId = shapeId.replace(/^shape:/, '')

	const resp = await client.send(
		new PutCommand({
			Item: {
				PK: shapeId,
				html: html,
			},
			TableName,
		})
	)
