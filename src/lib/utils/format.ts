export const formatNumberShort = (count: number): string => {
  if (count >= 10000) {
    return (count / 1000).toFixed(0) + 'K'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(2) + 'K'
  }
  return count.toString()
}
