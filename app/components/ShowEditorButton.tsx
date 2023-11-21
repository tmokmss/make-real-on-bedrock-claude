import { Editor, Icon, stopEventPropagation } from '@tldraw/tldraw'

export const EDITOR_WIDTH = 1000

export function ShowEditorButton({ shape, editor }: { shape: PreviewShape; editor: Editor }) {
	return (
		<button
			style={{
				all: 'unset',
				height: 40,
				width: 40,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
				pointerEvents: 'all',
			}}
			onClick={() => {
				if (shape.props.isShowingEditor) {
					editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							isShowingEditor: false,
							w: shape.props.w - EDITOR_WIDTH,
						},
					})
				} else {
					editor.updateShape({
						id: shape.id,
						type: shape.type,
						props: {
							isShowingEditor: true,
							w: shape.props.w + EDITOR_WIDTH,
						},
					})
				}
			}}
			onPointerDown={stopEventPropagation}
			title="Show code"
		>
			<Icon icon="follow" />
		</button>
	)
}
