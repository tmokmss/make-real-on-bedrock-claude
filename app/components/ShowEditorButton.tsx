import { Icon, stopEventPropagation } from '@tldraw/tldraw'

export function ShowEditorButton({
	isShowingEditor,
	setIsShowingEditor,
}: {
	isShowingEditor: boolean
	setIsShowingEditor: (isShowingEditor: boolean) => void
}) {
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
				setIsShowingEditor(!isShowingEditor)
			}}
			onPointerDown={stopEventPropagation}
			title="Show code"
		>
			<Icon icon="follow" />
		</button>
	)
}
