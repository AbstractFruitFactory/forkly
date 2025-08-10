export function clickOutside(
	node: HTMLElement,
	{
		callback,
		swallowOn
	}: {
		callback: () => void
		swallowOn?:
			| HTMLElement
			| null
			| (() => HTMLElement | null | undefined)
			| Array<HTMLElement | null | undefined | (() => HTMLElement | null | undefined)>
	}
) {
	const toArray = (
		value:
			| HTMLElement
			| null
			| (() => HTMLElement | null | undefined)
			| Array<HTMLElement | null | undefined | (() => HTMLElement | null | undefined)>
			| undefined
	) => (Array.isArray(value) ? value : value != null ? [value] : [])

	const resolveElement = (v: HTMLElement | null | undefined | (() => HTMLElement | null | undefined)) =>
		typeof v === 'function' ? v() : v

	let currentSwallowList = toArray(swallowOn)

	const shouldSwallow = (event: MouseEvent) => {
		const target = event.target as Node | null
		if (!target) return false
		for (const candidate of currentSwallowList) {
			const el = resolveElement(candidate)
			if (el && el.contains(target)) return true
		}
		return false
	}

	const handleClick = (event: MouseEvent) => {
		const target = event.target as Node | null
		if (!target) return

		if (node && !node.contains(target) && !event.defaultPrevented) {
			callback()

			if (shouldSwallow(event)) {
				// Swallow only when clicking on specified elements (e.g., the trigger)
				event.stopPropagation()
				event.preventDefault()
			}
		}
	}

	document.addEventListener('click', handleClick, true)

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true)
		},
		update({ callback: _cb, swallowOn: _swallowOn }: {
			callback: () => void
			swallowOn?:
				| HTMLElement
				| null
				| (() => HTMLElement | null | undefined)
				| Array<HTMLElement | null | undefined | (() => HTMLElement | null | undefined)>
		}) {
			// Keep callback updated by closure behavior in JS; only update swallow list here
			currentSwallowList = toArray(_swallowOn)
		}
	}
} 