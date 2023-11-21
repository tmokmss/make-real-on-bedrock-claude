import { Editor as MonacoEditor, OnChange } from '@monaco-editor/react'
import { Editor, toDomPrecision, useIsDarkMode } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { EDITOR_WIDTH } from './ShowEditorButton'

export function ShowResult({
	boxShadow,
	editor,
	html,
	isEditing,
	shape,
}: {
	boxShadow: string
	editor: Editor
	html: string
	isEditing: boolean
	shape: PreviewShape
}) {
	const dark = useIsDarkMode()
	const { isShowingEditor } = shape.props

	const handleOnChange: OnChange = useCallback(
		(value, _event) => {
			editor.updateShape({
				id: shape.id,
				type: shape.type,
				props: {
					html: value,
				},
			})
		},
		[editor, shape.id, shape.type]
	)

	return (
		<>
			<iframe
				srcDoc={html}
				width={toDomPrecision(shape.props.w - (shape.props.isShowingEditor ? EDITOR_WIDTH : 0))}
				height={toDomPrecision(shape.props.h)}
				draggable={false}
				style={{
					flexShrink: 1,
					pointerEvents: isEditing ? 'auto' : 'none',
					boxShadow,
					border: '1px solid var(--color-panel-contrast)',
					borderRadius: 'var(--radius-2)',
				}}
			/>
			{isShowingEditor && (
				<div style={{ width: EDITOR_WIDTH, height: '100%' }}>
					<MonacoEditor
						defaultLanguage="html"
						defaultValue={html}
						onChange={handleOnChange}
						theme={dark ? 'vs-dark' : 'vs-light'}
						options={{
							minimap: {
								enabled: false,
							},
							lineNumbers: 'off',
							wordWrap: 'wordWrapColumn',
							wordWrapColumn: 80,
							fontSize: 13,
						}}
					/>
				</div>
			)}
		</>
	)
}
