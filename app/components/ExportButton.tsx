import { useMakeHappen } from '../hooks/useMakeHappen'
import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton() {
	const makeReal = useMakeReal()
	const makeHappen = useMakeHappen()

	return (
		<div>
			<button
				onClick={makeHappen}
				className="p-2 pr-0"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
					Make Happen
				</div>
			</button>
			<button
				onClick={makeReal}
				className="px-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button>
		</div>
	)
}
