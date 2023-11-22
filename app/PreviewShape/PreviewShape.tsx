/* eslint-disable react-hooks/rules-of-hooks */
import {
	BaseBoxShapeUtil,
	DefaultSpinner,
	HTMLContainer,
	TLBaseShape,
	Vec2d,
	useIsEditing,
	useValue,
} from '@tldraw/tldraw'
import { useState } from 'react'
import { CopyToClipboardButton } from '../components/CopyToClipboardButton'
import { Hint } from '../components/Hint'
import { ShowResult } from '../components/ShowResult'
import { UrlLinkButton } from '../components/UrlLinkButton'

export type PreviewShape = TLBaseShape<
	'preview',
	{
		html: string
		source: string
		w: number
		h: number
		isShowingEditor: boolean
	}
>

function getHtmlToUse(html: string) {
	if (!html) return null

	if (
		html.includes(
			"<script>document.body.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); return }, { passive: false })</script>"
		)
	) {
		return html
	}

	return html.replace(
		`</body>`,
		`<script>document.body.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); return }, { passive: false })</script>
</body>`
	)
}

export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			source: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
			isShowingEditor: false,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShape) => false
	override canResize = (_shape: PreviewShape) => true
	override canBind = (_shape: PreviewShape) => false
	override canUnmount = () => false

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const [isShowingEditor, setIsShowingEditor] = useState(false)

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		const { html } = shape.props

		// Kind of a hack—we're preventing user's from pinching-zooming into the iframe
		const htmlToUse = getHtmlToUse(html)

		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{htmlToUse ? (
					<ShowResult boxShadow={boxShadow} html={htmlToUse} isEditing={isEditing} shape={shape} />
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-culled)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow,
							border: '1px solid var(--color-panel-contrast)',
							borderRadius: 'var(--radius-2)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}
				{htmlToUse && (
					<>
						<div
							style={{
								position: 'absolute',
								top: 0,
								right: -40,
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CopyToClipboardButton shape={shape} />
							<UrlLinkButton shape={shape} />
						</div>
						<Hint isEditing={isEditing} />
					</>
				)}
			</HTMLContainer>
		)
	}

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
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
		const vec = new Vec2d(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}
