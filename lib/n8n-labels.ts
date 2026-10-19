export function formatN8nLabel(text: string): string {
  return text.replace(/\b(llm|lm)\b/gi, match => match.toUpperCase())
}
