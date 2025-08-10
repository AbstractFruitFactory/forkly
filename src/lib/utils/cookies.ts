import type { UnitSystem } from '$lib/state/unitPreference.svelte'

type CookieEntry<K, V> = {
  key: K
  value: V
}

export type SearchCookie = {
  query: string
  tags: string[]
  ingredients: string[]
  excludedIngredients: string[]
  sort: 'popular' | 'newest' | 'easiest'
}

export type PaginationCookie = {
  page: number
}

export const useCookies = <
  T extends CookieEntry<'search', SearchCookie>
  | CookieEntry<'pagination', PaginationCookie>
  | CookieEntry<'unit', UnitSystem>,
  V extends T['key']
>(
  item: V
) => ({
  set: (value: Extract<T, { key: V }>['value']) => {
    document.cookie = `${item}=${JSON.stringify(value)}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`
  },
  get: () => {
    const cookie = document.cookie.split(';').find((cookie) => cookie.includes(item))
    return cookie ? JSON.parse(cookie.split('=')[1]) as Extract<T, { key: V }>['value'] : undefined
  },
  clear: () => (document.cookie = `${item}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`)
})