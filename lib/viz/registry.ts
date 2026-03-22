export const vizRegistry: Record<string, () => Promise<(el: HTMLElement) => void>> = {
  'ai-adoption-bars': () => import('./ai-adoption-bars').then(m => m.default),
}
