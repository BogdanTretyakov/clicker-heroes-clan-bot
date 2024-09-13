export const isNotNil = <T,>(val: T): val is Exclude<T, undefined|null|false> => !!val