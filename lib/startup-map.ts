import dataset from '@/public/data/startups/companies.json'

export type Startup = (typeof dataset.companies)[number]
export const startups = dataset.companies
export const startupMeta = dataset.meta

// Approximate city reference points, NOT company geocodes. Decimal places
// support projection calculations and do not imply street-level precision.
export const cities = [
  { name: 'San Francisco', coordinates: [-122.4194, 37.7749], label: [-20, -50] },
  { name: 'Palo Alto', coordinates: [-122.1430, 37.4419], label: [-22, -24] },
  { name: 'Mountain View', coordinates: [-122.0838, 37.3861], label: [-25, 35] },
] as const

export const referenceCities = [
  { name: 'Oakland', coordinates: [-122.2711, 37.8044] },
  { name: 'Berkeley', coordinates: [-122.2727, 37.8715] },
  { name: 'San Mateo', coordinates: [-122.3255, 37.5630] },
  { name: 'Fremont', coordinates: [-121.9886, 37.5483] },
  { name: 'San Jose', coordinates: [-121.8863, 37.3382] },
  { name: 'San Rafael', coordinates: [-122.5311, 37.9735] },
] as const

export function filterStartups(rows: Startup[], query: string, layer: string, category: string, city = '') {
  const term = query.trim().toLowerCase()
  return rows.filter(row =>
    (!term || `${row.name} ${row.description} ${row.city} ${row.category}`.toLowerCase().includes(term)) &&
    (layer === 'all' || row.classification === layer) &&
    (!category || row.category === category) && (!city || row.city === city))
}

export function startupCsv(rows: Startup[]) {
  const keys = Object.keys(rows[0] || startups[0]) as (keyof Startup)[]
  const quote = (value: unknown) => {
    let text = value == null ? '' : String(value)
    // Prevent spreadsheet formula execution when future records are imported.
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
    return `"${text.replaceAll('"', '""')}"`
  }
  return [keys.join(','), ...rows.map(row => keys.map(key => quote(row[key])).join(','))].join('\r\n')
}
