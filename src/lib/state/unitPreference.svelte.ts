import { browser } from '$app/environment'
import { useCookies } from '$lib/utils/cookies'

export type UnitSystem = 'metric' | 'imperial'

const getInitialValue = (): UnitSystem => {
  if (!browser) return 'imperial'
  const storedPreference = useCookies('unit').get()
  return storedPreference || 'imperial'
}

let _unitSystem = $state<UnitSystem>(getInitialValue())

if (browser) {
  useCookies('unit').set(_unitSystem)
}

export const unitPreferenceStore = {
  get value() {
    return _unitSystem
  },

  setMetric() {
    _unitSystem = 'metric'
  },

  setImperial() {
    _unitSystem = 'imperial'
  },

  toggleUnitSystem() {
    _unitSystem = _unitSystem === 'metric' ? 'imperial' : 'metric'
  }
}