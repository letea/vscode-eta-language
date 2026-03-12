const VOID_HTML_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function repeatIndent(level, unit) {
  return unit.repeat(Math.max(0, level));
}

function stripEtaBlocks(line) {
  return line.replace(/<<?%[\s\S]*?%>/g, '');
}

function startsWithClosingHtmlTag(line) {
  return /^<\/[A-Za-z][\w:-]*\b/.test(line);
}

function getHtmlDelta(lineWithoutEta) {
  const tagRegex = /<\/?([A-Za-z][\w:-]*)\b[^>]*>/g;
  let match;
  let delta = 0;

  while ((match = tagRegex.exec(lineWithoutEta)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = /\/>$/.test(fullTag) || VOID_HTML_TAGS.has(tagName);

    if (isClosing) {
      delta -= 1;
      continue;
    }

    if (!isSelfClosing) {
      delta += 1;
    }
  }

  return delta;
}

function detectEtaLineKind(trimmedLine, inEtaBlock) {
  if (inEtaBlock) {
    if (trimmedLine.includes('%>')) {
      return 'etaBlockEnd';
    }
    return 'etaBlockMiddle';
  }

  if (!/^<<?%[-_]?[=~]?/.test(trimmedLine)) {
    return 'none';
  }

  if (/^<<?%[-_]?[=~]?[\s\S]*[-_]?%>$/.test(trimmedLine)) {
    return 'etaSingleLine';
  }

  return 'etaBlockStart';
}

function extractEtaCode(trimmedLine, kind) {
  let code = trimmedLine;

  if (kind === 'etaSingleLine' || kind === 'etaBlockStart') {
    code = code.replace(/^<<?%[-_]?[=~]?/, '');
  }

  if (kind === 'etaSingleLine' || kind === 'etaBlockEnd') {
    const endIndex = code.indexOf('%>');
    if (endIndex >= 0) {
      code = code.slice(0, endIndex);
    }
    code = code.replace(/[-_]\s*$/, '');
  }

  return code.trim();
}

function countLeadingStructureClosers(code) {
  let count = 0;
  while (count < code.length && (code[count] === '}' || code[count] === ']')) {
    count += 1;
  }
  return count;
}

function removeLeadingStructureClosers(code, count) {
  if (count <= 0) {
    return code;
  }
  return code.slice(count).trimStart();
}

function countStructureDelta(code) {
  let delta = 0;
  let quote = null;
  let escape = false;

  for (let i = 0; i < code.length; i += 1) {
    const ch = code[i];

    if (quote !== null) {
      if (escape) {
        escape = false;
        continue;
      }

      if (ch === '\\') {
        escape = true;
        continue;
      }

      if (ch === quote) {
        quote = null;
      }

      continue;
    }

    if (ch === '\'' || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{' || ch === '[') {
      delta += 1;
      continue;
    }

    if (ch === '}' || ch === ']') {
      delta -= 1;
    }
  }

  return delta;
}

function splitMixedEtaHtmlLine(line) {
  const normalized = line
    .replace(/(%>)\s*(?=<\/?[A-Za-z!])/g, '$1\n')
    .replace(/((?<!%)>)\s*(?=<<?%[-_]?[=~]?)/g, '$1\n');

  return normalized.split('\n');
}

function expandLinesForFormatting(lines) {
  const expanded = [];

  for (const line of lines) {
    const parts = splitMixedEtaHtmlLine(line);
    expanded.push(...parts);
  }

  return expanded;
}

function formatEtaText(text, options = {}) {
  const editorTabSize =
    typeof options.tabSize === 'number' && Number.isFinite(options.tabSize)
      ? Math.max(1, Math.floor(options.tabSize))
      : null;
  const configuredIndent =
    typeof options.indentSize === 'number' && Number.isFinite(options.indentSize)
      ? Math.max(1, Math.floor(options.indentSize))
      : 2;
  const indentSize = editorTabSize ?? configuredIndent;
  const indentUnit = options.insertSpaces === false ? '\t' : ' '.repeat(indentSize);

  const lines = expandLinesForFormatting(text.split(/\r?\n/));
  const formattedLines = [];
  let htmlDepth = 0;
  let etaDepth = 0;
  let inEtaBlock = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length === 0) {
      formattedLines.push('');
      continue;
    }

    const etaLineKind = detectEtaLineKind(trimmedLine, inEtaBlock);
    const htmlLine = etaLineKind === 'none' ? stripEtaBlocks(trimmedLine) : '';
    const hasLeadingHtmlClose = startsWithClosingHtmlTag(htmlLine);
    const effectiveHtmlDepth = Math.max(0, htmlDepth - (hasLeadingHtmlClose ? 1 : 0));

    let lineIndentLevel = Math.max(0, effectiveHtmlDepth + etaDepth);

    if (etaLineKind !== 'none') {
      const etaCode = extractEtaCode(trimmedLine, etaLineKind);
      const leadingClosers = countLeadingStructureClosers(etaCode);
      const effectiveEtaDepth = Math.max(0, etaDepth - leadingClosers);
      const normalizedCode = removeLeadingStructureClosers(etaCode, leadingClosers);
      const structureDelta = countStructureDelta(normalizedCode);

      lineIndentLevel = Math.max(0, effectiveHtmlDepth + effectiveEtaDepth);
      etaDepth = Math.max(0, effectiveEtaDepth + structureDelta);

      if (etaLineKind === 'etaBlockStart') {
        inEtaBlock = true;
      } else if (etaLineKind === 'etaBlockEnd') {
        inEtaBlock = false;
      }
    } else {
      const htmlDelta = getHtmlDelta(htmlLine);
      htmlDepth = Math.max(0, htmlDepth + htmlDelta);
    }

    formattedLines.push(`${repeatIndent(lineIndentLevel, indentUnit)}${trimmedLine}`);
  }

  return formattedLines.join('\n');
}

module.exports = {
  formatEtaText,
};
