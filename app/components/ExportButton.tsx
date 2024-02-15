import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton() {
	const makeReal = useMakeReal()

	return (
		<button
			onClick={makeReal}
			className="p-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			<div
				className="
			bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
			>
				{/* hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> */}
				Make Happen
			</div>
		</button>
	)
}
