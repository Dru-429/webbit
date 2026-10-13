/** Lightweight syntax highlight for the code panel (no extra deps). */
export function highlightCode(code: string, filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const escaped = escapeHtml(code)

  if (['json'].includes(ext)) {
    return escaped
      .replace(
        /(&quot;[^&]*&quot;)(\s*:)/g,
        '<span class="tok-key">$1</span>$2',
      )
      .replace(
        /:\s*(&quot;[^&]*&quot;)/g,
        ': <span class="tok-string">$1</span>',
      )
      .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="tok-number">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span class="tok-keyword">$1</span>')
  }

  if (['html', 'svg'].includes(ext)) {
    return escaped
      .replace(
        /(&lt;\/?)([\w-]+)/g,
        '$1<span class="tok-tag">$2</span>',
      )
      .replace(
        /([\w-]+)=(&quot;[^&]*&quot;)/g,
        '<span class="tok-attr">$1</span>=<span class="tok-string">$2</span>',
      )
  }

  if (['css'].includes(ext)) {
    return escaped
      .replace(/([.#]?[\w-]+)(\s*\{)/g, '<span class="tok-tag">$1</span>$2')
      .replace(
        /([\w-]+)(\s*:)/g,
        '<span class="tok-key">$1</span>$2',
      )
  }

  // JS / TS / JSX / TSX / default
  return escaped
    .replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span class="tok-comment">$1</span>',
    )
    .replace(
      /\b(export|import|from|type|interface|const|let|var|function|return|if|else|for|while|class|extends|new|async|await|default|true|false|null|undefined|typeof|keyof|of|in)\b/g,
      '<span class="tok-keyword">$1</span>',
    )
    .replace(
      /\b(string|number|boolean|any|void|never|Record|React|Promise)\b/g,
      '<span class="tok-type">$1</span>',
    )
    .replace(
      /(&quot;[^&]*&quot;|&#39;[^&#]*&#39;|`[^`]*`)/g,
      '<span class="tok-string">$1</span>',
    )
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-number">$1</span>')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
