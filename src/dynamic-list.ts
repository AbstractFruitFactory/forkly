
import type { Writable } from 'svelte/store'

export function fade(node, { enabled, delay = 0, duration = 400 }) {
    if (enabled) {
        const o = +getComputedStyle(node).opacity;

        return {
            delay,
            duration,
            css: (t) => `opacity: ${t * o}`,
        };
    }
}

export function onInput(
    dispatch: (event: "clear" | "input", obj: { id: number }) => {},
    id: number,
    clearCondition: () => boolean
) {
    if (clearCondition()) {
        dispatch("clear", {
            id,
        });
    } else {
        dispatch("input", {
            id,
        });
    }
}

export function addItem(items: Array<{ id: number }>, lastId: Writable<number>, event) {
    if (items[items.length - 1].id === event.detail.id) {
        const newId = event.detail.id + 1;
        lastId.update((id) => newId);
        return [...items, { id: newId }];
    }
}

export function removeItem(items: Array<{ id: number }>, lastId: Writable<number>, event) {
    const originalLength = items.length
    items = items.filter((item) => {
        return item.id !== event.detail.id;
    });
    lastId.update((id) => items[items.length - 1].id);
    if (items.length != originalLength) {
        return items
    }
}