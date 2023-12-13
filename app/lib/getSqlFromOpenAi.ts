import { PreviewShape } from '../PreviewShape/PreviewShape'
import { OPENAI_SQL_USER_PROMPT, OPEN_AI_SQL_SYSTEM_PROMPT } from '../prompt'

export async function getSqlFromOpenAI({
	image,
	apiKey,
	text,
	theme = 'light',
	previousPreviews,
}: {
	image: string
	apiKey: string
	text: string
	theme?: string
	previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	const messages: GPT4VCompletionRequest['messages'] = [
		{
			role: 'system',
			content: OPEN_AI_SQL_SYSTEM_PROMPT,
		},
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[1].content as Exclude<MessageContent, string>

	// Add the image
	userContent.push(
		{
			type: 'text',
			text: OPENAI_SQL_USER_PROMPT,
		},
		{
			type: 'image_url',
			image_url: {
				url: image,
				detail: 'high',
			},
		}
	)

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of text that we found in the design:\n${text}`,
		})
	} else {
		userContent.push({
			type: 'text',
			text: `There wasn't any text in this design. You'll have to work from just the images.`,
		})
	}

	const body: GPT4VCompletionRequest = {
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		temperature: 0,
		messages,
	}

	let json = null

	try {
		const resp = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		})
		json = await resp.json()
	} catch (e) {
		console.log(e)
	}

	return json
}

type MessageContent =
	| string
	| (
			| string
			| {
					type: 'image_url'
					image_url:
						| string
						| {
								url: string
								detail: 'low' | 'high' | 'auto'
						  }
			  }
			| {
					type: 'text'
					text: string
			  }
	  )[]

export type GPT4VCompletionRequest = {
	model: 'gpt-4-vision-preview'
	messages: {
		role: 'system' | 'user' | 'assistant' | 'function'
		content: MessageContent
		name?: string | undefined
	}[]
	functions?: any[] | undefined
	function_call?: any | undefined
	stream?: boolean | undefined
	temperature?: number | undefined
	top_p?: number | undefined
	max_tokens?: number | undefined
	n?: number | undefined
	best_of?: number | undefined
	frequency_penalty?: number | undefined
	presence_penalty?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}
