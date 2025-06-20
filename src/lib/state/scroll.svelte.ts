import { browser } from '$app/environment'

let _scrollPosition = $state(0)
let _scrollContainer = $state<HTMLElement | null>(null)

export const scrollStore = {
  get scrollPosition() {
    return _scrollPosition
  },

  get scrollContainer() {
    return _scrollContainer
  },

  setScrollContainer(container: HTMLElement) {
    _scrollContainer = container
    this.updateScrollPosition()
    const handleScroll = () => this.updateScrollPosition()
    container.addEventListener('scroll', handleScroll)
  },

  updateScrollPosition() {
    if (!_scrollContainer) return
    _scrollPosition = _scrollContainer.scrollTop
  },

  scrollToTop(behavior: 'smooth' | 'instant' = 'smooth') {
    if (!_scrollContainer) return
    _scrollContainer.scrollTo({ top: 0, behavior })
  },

  scrollToElement(element: HTMLElement) {
    if (!_scrollContainer) return
    
    let currentElement = element
    let totalOffset = 0
    
    
    while (currentElement && currentElement !== _scrollContainer) {
      totalOffset += currentElement.offsetTop
      currentElement = currentElement.offsetParent as HTMLElement
    }
    
    const containerRect = _scrollContainer.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const alternativeOffset = _scrollContainer.scrollTop + elementRect.top - containerRect.top
    
    // Scroll to position the element at the top of the viewport with some padding
    const scrollPosition = Math.max(0, totalOffset + 5)

    // Try direct scrollTop assignment first
    _scrollContainer.scrollTop = scrollPosition
    
    // Also try scrollTo as backup
    setTimeout(() => {
      if (_scrollContainer) {
        _scrollContainer.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
      }
    }, 100)
  }
}

if (browser) {
  window.addEventListener('resize', () => {
    scrollStore.updateScrollPosition()
  })
} 