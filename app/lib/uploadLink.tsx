'use server'

export async function uploadLink(shapeId: string, html: string) {
	if (typeof shapeId !== 'string' || !shapeId.startsWith('shape:')) {
		throw new Error('shapeId must be a string starting with shape:')
	}
	if (typeof html !== 'string') {
		throw new Error('html must be a string')
	}

	shapeId = shapeId.replace(/^shape:/, '')
	await fetch('/api/db', {
		method: 'POST',
		body: JSON.stringify({
			shapeId,
			html,
		}),
	})
}
