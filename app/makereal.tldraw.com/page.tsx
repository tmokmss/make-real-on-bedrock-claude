/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import '@tldraw/tldraw/tldraw.css'
import dynamic from 'next/dynamic'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { APIKeyInput } from '../components/APIKeyInput'
import { ExportButton } from '../components/ExportButton'

import { StateNode } from '@tldraw/tldraw'
import { PromptShapeUtil } from '../PromptShape/PromptShape'
import { LinkArea } from '../components/LinkArea'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil, PromptShapeUtil]

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				shapeUtils={shapeUtils}
				components={{ SharePanel: () => <ExportButton /> }}
				onMount={(editor) => {
					class PromptTool extends StateNode {
						static id = 'prompt'

						override onPointerDown = () => {
							// create a new prompt shape
							console.log('yep')
							const { x, y } = editor.inputs.currentPagePoint
							editor.createShape({
								type: 'prompt',
								x: x - (960 * 2) / 3 / 2,
								y: y - (540 * 2) / 3 / 2,
							})
							if (!editor.getInstanceState().isToolLocked) {
								editor.setCurrentTool('select')
							}
						}
					}

					editor.root.children['prompt'] = new PromptTool(editor)
				}}
			>
				<APIKeyInput />
				<LinkArea />
			</Tldraw>
		</div>
	)
}
