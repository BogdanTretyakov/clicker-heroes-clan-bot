export const debugLog = (...args: Parameters<typeof console.log>) => {
  if (process.env.NODE_ENV === 'production') return
  console.log(...args)
}
