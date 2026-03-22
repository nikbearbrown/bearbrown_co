import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

export function getSql() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!)
  }
  return _sql
}

// Tagged template proxy that lazily initializes the connection
export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return getSql()(...(args as [TemplateStringsArray, ...unknown[]]))
  },
  get(_target, prop) {
    // Support tagged template literals: sql`...`
    // When used as sql`query`, JS calls sql as a function with template args
    return Reflect.get(getSql(), prop)
  },
})
