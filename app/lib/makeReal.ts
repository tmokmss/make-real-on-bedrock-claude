import { Editor, TLTextShape, createShapeId, getSvgAsImage } from '@tldraw/tldraw'
import { blobToBase64 } from './blobToBase64'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { getSelectionAsText } from './getSelectionAsText'

export async function makeReal(editor: Editor, apiKey: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY } = editor.getSelectionPageBounds()
	const newShapeId = createShapeId()
	editor.createShape<TLTextShape>({
		id: newShapeId,
		type: 'text',
		x: maxX + 60, // to the right of the selection
		y: midY,
		props: {
			text: 'Loading...',
			w: 500,
			color: 'black',
			font: 'mono',
			align: 'start',
			autoSize: true,
		},
	})

	// Get an SVG based on the selected shapes
	const svg = await editor.getSvg(selectedShapes, {
		scale: 1,
		background: true,
	})

	if (!svg) throw Error(`Could not get the SVG.`)

	// Turn the SVG into a DataUrl
	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	const blob = await getSvgAsImage(svg, IS_SAFARI, {
		type: 'png',
		quality: 0.8,
		scale: 1,
	})
	const dataUrl = await blobToBase64(blob!)
	// downloadDataURLAsFile(dataUrl, 'tldraw.png')

	// Send everything to OpenAI and get some HTML back
	try {
		const json = await getHtmlFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
		})

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		const message = json.choices[0].message.content

		// Update the shape with the new props
		const shape = editor.getShape<TLTextShape>(newShapeId)
		editor.updateShape<TLTextShape>({
			id: newShapeId,
			type: 'text',
			props: {
				...shape.props,
				text: message,
			},
		})

		editor.updateShape<TLTextShape>({
			id: newShapeId,
			type: 'text',
			props: {
				...shape.props,
				text: message,
				// w: 1000,
			},
		})

		console.log(`Response: ${message}`)
	} catch (e) {
		// If anything went wrong, delete the shape.
		editor.deleteShape(newShapeId)
		throw e
	}
}
