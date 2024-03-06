/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import 'tldraw/tldraw.css'
import dynamic from 'next/dynamic'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { ExportButton } from '../components/ExportButton'

import { LinkArea } from '../components/LinkArea'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				shapeUtils={shapeUtils}
				components={{ SharePanel: () => <ExportButton /> }}
			>
				<LinkArea />
			</Tldraw>
		</div>
	)
}
