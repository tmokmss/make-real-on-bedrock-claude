/* eslint-disable react-hooks/rules-of-hooks */
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	HTMLContainer,
	toDomPrecision,
	Icon,
	useToasts,
	DefaultSpinner,
	stopEventPropagation,
	Vec2d,
	useValue,
	uniqueId,
} from '@tldraw/tldraw'
import { UrlLinkButton } from '../components/UrlLinkButton'
import { LINK_HOST, PROTOCOL } from '../lib/hosts'
import { useEffect } from 'react'
import { uploadLink } from '../lib/uploadLink'

export type PreviewShape = TLBaseShape<
	'preview',
	{
		html: string
		source: string
		w: number
		h: number
		linkId?: string
		linkUploadVersion?: number
	}
>

export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			source: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShape) => false
	override canResize = (_shape: PreviewShape) => true
	override canBind = (_shape: PreviewShape) => false
	override canUnmount = () => false

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		const { html, linkUploadVersion } = shape.props

		const isUploadingHtmlForLink = linkUploadVersion === undefined || !shape.props.linkId

		// upload the html if we haven't already:
		useEffect(() => {
			let isCancelled = false
			if (html && isUploadingHtmlForLink) {
				;(async () => {
					// todo: delete the shape on error?
					const linkId = uniqueId()
					await uploadLink(linkId, html)
					if (isCancelled) return
					this.editor.updateShape<PreviewShape>({
						id: shape.id,
						type: 'preview',
						props: {
							linkUploadVersion: 1,
						},
					})
				})()
			}
			return () => {
				isCancelled = true
			}
		}, [shape.id, html, linkUploadVersion, isUploadingHtmlForLink])

		const uploadUrl = [
			PROTOCOL,
			LINK_HOST,
			'/',
			shape.props.linkId ?? shape.id.replace(/^shape:/, ''),
		].join('')

		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{isUploadingHtmlForLink ? (
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
				) : (
					<>
						<iframe
							src={`${uploadUrl}?preview=1&v=${linkUploadVersion}`}
							width={toDomPrecision(shape.props.w)}
							height={toDomPrecision(shape.props.h)}
							draggable={false}
							style={{
								pointerEvents: isEditing ? 'auto' : 'none',
								boxShadow,
								border: '1px solid var(--color-panel-contrast)',
								borderRadius: 'var(--radius-2)',
							}}
						/>
						<button
							style={{
								all: 'unset',
								position: 'absolute',
								top: 0,
								right: -40,
								height: 40,
								width: 40,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								pointerEvents: 'all',
							}}
							onClick={() => {
								if (navigator && navigator.clipboard) {
									navigator.clipboard.writeText(shape.props.html)
									toast.addToast({
										icon: 'code',
										title: 'Copied html to clipboard',
									})
								}
							}}
							onPointerDown={stopEventPropagation}
							title="Copy code to clipboard"
						>
							<Icon icon="code" />
						</button>
						<UrlLinkButton uploadUrl={uploadUrl} />
						<div
							style={{
								textAlign: 'center',
								position: 'absolute',
								bottom: isEditing ? -40 : 0,
								padding: 4,
								fontFamily: 'inherit',
								fontSize: 12,
								left: 0,
								width: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								pointerEvents: 'none',
							}}
						>
							<span
								style={{
									background: 'var(--color-panel)',
									padding: '4px 12px',
									borderRadius: 99,
									border: '1px solid var(--color-muted-1)',
								}}
							>
								{isEditing ? 'Click the canvas to exit' : 'Double click to interact'}
							</span>
						</div>
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
