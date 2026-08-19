/**
 * Dispara o download de um arquivo no navegador a partir de um `Blob`.
 *
 * Mora em `core/utils` porque três caminhos precisam do mesmo gesto — XML
 * individual, DANFE e exportação em lote — e cada cópia é uma chance a mais de
 * esquecer o `revokeObjectURL` e vazar a URL do objeto.
 */
export function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  URL.revokeObjectURL(url)
}
