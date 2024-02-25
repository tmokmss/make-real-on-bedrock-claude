/* eslint-disable react-hooks/rules-of-hooks */
import {
	BaseBoxShapeUtil,
	HTMLContainer,
	TLBaseShape,
	TLShape,
	Vec,
	stopEventPropagation,
	useValue,
} from '@tldraw/tldraw'

export type PromptShape = TLBaseShape<
	'prompt',
	{
		w: number
		h: number
		systemPrompt: string
		userPrompt: string
	}
>

export class PromptShapeUtil extends BaseBoxShapeUtil<PromptShape> {
	static override type = 'prompt' as const

	getDefaultProps(): PromptShape['props'] {
		return {
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
			systemPrompt: 'You are a useful assistant.',
			userPrompt: 'How far away is the moon?',
		}
	}

	override isAspectRatioLocked = (_shape: PromptShape) => false
	override canResize = (_shape: PromptShape) => true
	override canBind = (_shape: PromptShape) => true
	override canDropShapes(shape: PromptShape, shapes: TLShape[]): boolean {
		return shapes.length === 1 && shapes[0].type === 'text'
	}

	override component(shape: PromptShape) {
		const rotation = useValue(
			'rotation',
			() => {
				return this.editor.getShapePageTransform(shape)!.rotation()
			},
			[this.editor]
		)

		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				<div
					style={{
						display: 'flex',
						width: '100%',
						height: '100%',
						gap: 16,
						flexDirection: 'column',
						padding: 16,
						boxShadow: getRotatedBoxShadow(rotation),
					}}
				>
					<label htmlFor="system">System Prompt</label>
					<textarea
						style={{
							padding: 16,
							fontFamily: 'monospace',
							height: '100%',
							resize: 'none',
							border: '1px solid var(--color-muted-2)',
						}}
						name="system"
						onPointerDown={stopEventPropagation}
						onChange={(e) => {
							this.editor.updateShape<PromptShape>({
								id: shape.id,
								type: 'prompt',
								props: {
									systemPrompt: e.target.value,
								},
							})
						}}
					>
						{shape.props.systemPrompt}
					</textarea>
					<label htmlFor="user">User Prompt</label>
					<textarea
						style={{
							padding: 16,
							fontFamily: 'monospace',
							height: '100%',
							resize: 'none',
							border: '1px solid var(--color-muted-2)',
						}}
						name="user"
						onPointerDown={stopEventPropagation}
						value={shape.props.userPrompt}
						onChange={(e) => {
							this.editor.updateShape<PromptShape>({
								id: shape.id,
								type: 'prompt',
								props: {
									userPrompt: e.target.value,
								},
							})
						}}
					>
						{shape.props.userPrompt}
					</textarea>
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: PromptShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	async toSvg(shape: PromptShape): Promise<SVGElement> {
		const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
		const apiKey = input?.value ?? null

		if (!apiKey) return null

		const { systemPrompt, userPrompt } = shape.props
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: 'gpt-3.5-turbo', // Use the latest model version
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
			}),
		})

		const data = await response.json()

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		rect.setAttribute('width', shape.props.w.toString())
		rect.setAttribute('height', shape.props.h.toString())
		rect.setAttribute('fill', 'white')
		rect.setAttribute('stroke', 'black')

		const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
		textElement.setAttribute('x', (shape.props.w / 2).toString())
		textElement.setAttribute('y', (shape.props.h / 2).toString())
		textElement.setAttribute('alignment-baseline', 'middle')
		textElement.setAttribute('text-anchor', 'middle')
		textElement.setAttribute('fill', 'black')
		textElement.setAttribute('font-size', '12')
		textElement.setAttribute('font-family', 'Arial')
		textElement.textContent = data.choices[0].message.content

		g.appendChild(rect)
		g.appendChild(textElement)

		return g
	}
}

// todo: export these from tldraw

const ROTATING_BOX_SHADOWS = [
	{
		offsetX: 0,
		offsetY: 2,
		blur: 4,
		spread: -1,
		color: '#0000003a',
	},
	{
		offsetX: 0,
		offsetY: 3,
		blur: 12,
		spread: -2,
		color: '#0000001f',
	},
]

function getRotatedBoxShadow(rotation: number) {
	const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
		const { offsetX, offsetY, blur, spread, color } = shadow
		const vec = new Vec(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}
