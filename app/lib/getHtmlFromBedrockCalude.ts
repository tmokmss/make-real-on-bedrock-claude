import { PreviewShape } from '../PreviewShape/PreviewShape'
import {
	OPENAI_USER_PROMPT,
	OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN,
	OPEN_AI_SYSTEM_PROMPT,
} from '../prompt'

export async function getHtmlFromBedrockClaude({
	image,
	apiKey,
	text,
	grid,
	theme = 'light',
	previousPreviews,
}: {
	image: string
	apiKey: string
	text: string
	theme?: string
	grid?: {
		color: string
		size: number
		labels: boolean
	}
	previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	const messages: ClaudeCompletionMessage = [
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[0].content as Exclude<MessageContent, string>

	// Add the prompt into
	userContent.push({
		type: 'text',
		text:
			previousPreviews.length > 0 ? OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN : OPENAI_USER_PROMPT,
	})

	// Add the image
	userContent.push({
		type: 'image',
		source: {
			type: 'base64',
			media_type: 'image/png',
			data: image,
		},
	})

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of text that we found in the design:\n${text}`,
		})
	}

	if (grid) {
		userContent.push({
			type: 'text',
			text: `The designs have a ${grid.color} grid overlaid on top. Each cell of the grid is ${grid.size}x${grid.size}px.`,
		})
	}

	// Add the previous previews as HTML
	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		userContent.push(
			{
				type: 'text',
				text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
			},
			{
				type: 'image',
				source: {
					type: 'base64',
					media_type: 'image/png',
					data: preview.props.source,
				},
			},
			{
				type: 'text',
				text: `And here's the HTML you came up with for it: ${preview.props.html}`,
			}
		)
	}

	// Prompt the theme
	userContent.push({
		type: 'text',
		text: `Please make your result use the ${theme} theme.`,
	})

	let json = null

	try {
		const resp = await fetch('/api/claude', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				systemPromopt: OPEN_AI_SYSTEM_PROMPT,
				messages,
			}),
		})
		json = await resp.json()
	} catch (e) {
		throw Error(`Could not contact Bedrock: ${e.message}`)
	}

	return json
}

// https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html
type MessageContent = (
	| {
			type: 'image'
			source: {
				type: 'base64'
				media_type: string
				data: string
			}
	  }
	| {
			type: 'text'
			text: string
	  }
)[]

export type ClaudeCompletionMessage = {
	role: 'user' | 'assistant'
	content: MessageContent
}[]
