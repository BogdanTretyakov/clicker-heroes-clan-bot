import { timeoutPromise } from "./promises"

export const asyncForEach = async <T,>(
  arr: T[],
  cb: (item: T) => Promise<unknown>,
  timeout = 0
) => {
  for (const item of arr) {
    await cb(item)
    if (timeout) {
      await timeoutPromise(timeout)
    }
  }
}
