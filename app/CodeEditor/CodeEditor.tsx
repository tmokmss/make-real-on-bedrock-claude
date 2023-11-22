import { OnChange } from '@monaco-editor/react'
import { track, useEditor, useIsDarkMode, stopEventPropagation } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { Editor as MonacoEditor } from '@monaco-editor/react'

export const CodeEditor = track(() => {
	const editor = useEditor()
	const dark = useIsDarkMode()
	const bounds = editor.getViewportPageBounds()
	const shape = editor.getOnlySelectedShape()
	const previewShape = shape?.type === 'preview' ? shape : undefined

	const handleOnChange: OnChange = useCallback(
		(value, _event) => {
			editor.updateShape({
				id: previewShape.id,
				type: previewShape.type,
				props: {
					html: value,
				},
			})
		},
		[editor, previewShape?.id, previewShape?.type]
	)
	if (!bounds || !previewShape || previewShape.type !== 'preview') return null

	const pageCoordinates = editor.pageToScreen(bounds.point)

	return (
		<div
			style={{
				position: 'absolute',
				top: Math.max(64, pageCoordinates.y - 64),
				left: 20,
				border: '1px solid #eee',
				pointerEvents: 'all',
			}}
			onClick={() => console.log('click')}
			onPointerDown={(e) => stopEventPropagation(e)}
		>
			<div style={{ width: 700, height: 700 }}>
				<MonacoEditor
					defaultLanguage="html"
					value={previewShape.props.html}
					onChange={handleOnChange}
					theme={dark ? 'vs-dark' : 'vs-light'}
					options={{
						minimap: {
							enabled: false,
						},
						lineNumbers: 'on',
						wordWrap: 'wordWrapColumn',
						wordWrapColumn: 80,
						fontSize: 13,
					}}
				/>
			</div>
		</div>
	)
})
