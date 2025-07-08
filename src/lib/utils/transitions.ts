import type { FlyParams } from 'svelte/transition'

export const FLY_LEFT_IN: FlyParams = { x: -50, duration: 300, delay: 500 }
export const FLY_LEFT_IN_SHORT: FlyParams = { x: -50, duration: 300, delay: 300 }
export const FLY_LEFT_OUT: FlyParams = { x: -50, duration: 300 }

export const FLY_DOWN_IN: FlyParams = { y: 50, duration: 300, delay: 300 }
export const FLY_DOWN_OUT: FlyParams = { y: 50, duration: 300 }