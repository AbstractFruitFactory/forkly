import { browser } from '$app/environment'

const getInitialValue = (): boolean => {
	if (!browser) return false
	const mobileBreakpoint = 768
	return window.innerWidth <= mobileBreakpoint
}

let _isMobile = $state<boolean>(getInitialValue())

if (browser) {
	const updateMobile = () => {
		const mobileBreakpoint = 768
		_isMobile = window.innerWidth <= mobileBreakpoint
	}

	window.addEventListener('resize', updateMobile)
}

export const mobileStore = {
	get isMobile() {
		return _isMobile
	}
} 