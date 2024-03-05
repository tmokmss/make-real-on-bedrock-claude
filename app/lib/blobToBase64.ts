export async function blobToBase64(blob: Blob): Promise<string> {
	const str: string = await new Promise((resolve, _) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.readAsDataURL(blob)
	})
	return str.split(',')[1]
}
