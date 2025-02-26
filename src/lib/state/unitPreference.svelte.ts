import { browser } from '$app/environment'

export type UnitSystem = 'metric' | 'imperial'

const getInitialValue = (): UnitSystem => {
  if (!browser) return 'imperial'
  const storedPreference = localStorage.getItem('unitSystem') as UnitSystem
  return storedPreference || 'imperial'
}

let _unitSystem = $state<UnitSystem>(getInitialValue())

if (browser) {
  localStorage.setItem('unitSystem', _unitSystem)
}

export const unitPreferenceStore = {
  get unitSystem() {
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