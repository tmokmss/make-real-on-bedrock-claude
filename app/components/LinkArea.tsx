import { useBreakpoint, useEditor, useValue } from 'tldraw'

export function LinkArea() {
	const breakpoint = useBreakpoint()
	const editor = useEditor()
	const isFocusMode = useValue('isFocusMode', () => editor.getInstanceState().isFocusMode, [editor])

	if (isFocusMode) return null

	return (
		<span
			className={`lockup__link ${
				breakpoint < 6 ? 'lockup__link__mobile' : ''
			} flex mb-1 items-center justify-center`}
		>
			<a
				href="https://twitter.com/tldraw"
			>
				<img alt="tldraw logo" className="lockup" src="/lockup.svg" />
			</a>
		</span>
	)
}
