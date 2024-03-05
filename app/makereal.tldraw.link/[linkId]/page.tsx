import { notFound } from 'next/navigation'
import { LinkComponent } from '../../components/LinkComponent'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'

export const dynamic = 'force-dynamic'

const ddb = new DynamoDBClient({})
const client = DynamoDBDocumentClient.from(ddb)
const TableName = process.env.TABLE_NAME ?? 'test-table'

export default async function LinkPage({
	params,
	searchParams,
}: {
	params: { linkId: string }
	searchParams: { preview?: string }
}) {
	const { linkId } = params
	const isPreview = !!searchParams.preview

	const resp = await client.send(
		new GetCommand({
			Key: {
				PK: linkId,
			},
			TableName,
		})
	)
	const result = resp.Item;

	if (result?.html == null) notFound()

	let html: string = result.html

	const SCRIPT_TO_INJECT_FOR_PREVIEW = `
    // send the screenshot to the parent window
  window.addEventListener('message', function(event) {
    if (event.data.action === 'take-screenshot' && event.data.shapeid === "shape:${linkId}") {
      html2canvas(document.body, {useCors : true, foreignObjectRendering: true, allowTaint: true }).then(function(canvas) {
        const data = canvas.toDataURL('image/png');
        window.parent.parent.postMessage({screenshot: data, shapeid: "shape:${linkId}"}, "*");
      });
    }
  }, false);
  // and prevent the user from pinch-zooming into the iframe
    document.body.addEventListener('wheel', e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
    }, { passive: false })
`

	if (isPreview) {
		html = html.includes('</body>')
			? html.replace(
					'</body>',
					`<script src="https://unpkg.com/html2canvas"></script><script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script></body>`
			  )
			: html + `<script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script>`
	}

	return <LinkComponent linkId={linkId} isPreview={isPreview} html={html} />
}
