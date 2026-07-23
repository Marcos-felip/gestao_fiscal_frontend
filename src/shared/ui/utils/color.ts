type ColorResolution = {
  className?: string
  style?: { color: string }
}

function isCssColorValue(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    lower.startsWith('#') ||
    lower.startsWith('rgb(') ||
    lower.startsWith('rgba(') ||
    lower.startsWith('hsl(') ||
    lower.startsWith('hsla(') ||
    lower.startsWith('oklch(') ||
    lower.startsWith('oklab(') ||
    lower.startsWith('color(') ||
    lower.startsWith('var(') ||
    lower.startsWith('--')
  )
}

export function resolveColor(value?: string): ColorResolution {
  if (!value) return {}

  if (isCssColorValue(value)) {
    const colorValue = value.startsWith('var(') ? value : value.startsWith('--') ? `var(${value})` : value
    return { style: { color: colorValue } }
  }

  return { className: value }
}
