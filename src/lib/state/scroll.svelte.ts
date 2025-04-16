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

  scrollToTop() {
    if (!_scrollContainer) return
    _scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
  },

  scrollToElement(element: HTMLElement) {
    if (!_scrollContainer) return
    const containerRect = _scrollContainer.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const scrollTop = _scrollContainer.scrollTop
    const elementTop = elementRect.top - containerRect.top + scrollTop

    _scrollContainer.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}

if (browser) {
  window.addEventListener('resize', () => {
    scrollStore.updateScrollPosition()
  })
} 