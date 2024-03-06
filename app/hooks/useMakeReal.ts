import { useEditor, useToasts } from 'tldraw'
import { useCallback } from 'react'
import { makeReal } from '../lib/makeReal'

export function useMakeReal() {
	const editor = useEditor()
	const toast = useToasts()

	return useCallback(async () => {
		const apiKey = 'TODO'

		try {
			await makeReal(editor, apiKey)
		} catch (e: any) {
			console.error(e)

			toast.addToast({
				title: 'Something went wrong',
				description: `${e.message.slice(0, 200)}`,
				actions: [
					{
						type: 'primary',
						label: 'Read the guide',
						onClick: () => {
							// open a new tab with the url...
							window.open(
								'https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e',
								'_blank'
							)
						},
					},
				],
			})
		}
	}, [editor, toast])
}
