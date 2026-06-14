/** Drop null/undefined/empty values recursively so empty filters disappear. */
export function compact(value: unknown): unknown {
  if (Array.isArray(value)) {
    const arr = value.map(compact).filter((v) => v !== undefined)
    return arr.length ? arr : undefined
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const c = compact(v)
      if (c !== undefined) out[k] = c
    }
    return Object.keys(out).length ? out : undefined
  }
  if (value === null || value === '') return undefined
  return value
}
