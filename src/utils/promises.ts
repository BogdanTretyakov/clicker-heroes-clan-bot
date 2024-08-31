export const timeoutPromise = (timeout: number) => new Promise<void>(res => setTimeout(res, timeout))
