export type KeyValuePair<K> = [K, any]

export type KeyValuePairs<K> = Array<KeyValuePair<K>>

export function getDeepValue (obj: any, path: number | string | string[]): any {
  const [first, ...parts] = Array.isArray(path) ? path : path.toString().split('.')

  if (!obj || !first) return undefined
  if (!parts.length) return obj[first]

  return getDeepValue(obj[first], parts)
}

export function toPairs<T> (obj: T): KeyValuePairs<keyof T> {
  if (!obj) return []

  return Object.keys(obj).map((key) => {
    return [key, (obj as any)[key]] as KeyValuePair<keyof T>
  })
}

export function match<T> (obj: T, conditions: KeyValuePairs<keyof T>) {
  for (const [key, value] of conditions) {
    if (getDeepValue(obj, key as string) !== value) return false
  }

  return true
}

export function deepCopy<T> (obj: T): T {
  if (
    typeof obj === 'boolean' ||
    typeof obj === 'number' ||
    typeof obj === 'string' ||
    obj === null
  ) {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj) as any
  }

  if (Array.isArray(obj)) {
    return obj.map((o) => deepCopy(o)) as any
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).reduce(
      (newObj, key) => {
        newObj[key] = deepCopy((obj as any)[key])
        return newObj
      },
      {} as any
    )
  }

  return undefined as any
}
