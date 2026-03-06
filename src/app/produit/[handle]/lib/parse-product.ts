// =============================================================================
// Pure functions for parsing product data
// =============================================================================

/** Extract 3 hero specs from product data for tech grid / spec badges */
export function extractTechGrid(
  title: string,
  description: string,
  specs: { label: string; value: string }[]
): { label: string; value: string }[] {
  const grid: { label: string; value: string }[] = [];
  const text = `${title} ${description}`.toUpperCase();

  // 1. Voltage (M18 = 18V, M12 = 12V, M28 = 28V)
  const voltMatch = text.match(/\bM(\d{2})\b/) || text.match(/(\d{2})\s*V(?:OLT)?/);
  if (voltMatch) {
    grid.push({ label: 'Voltage', value: `${voltMatch[1]}V` });
  }

  // 2. Try specs table for capacity, torque, diameter, etc.
  const heroSpecs = [
    { labels: ['capacité', 'volume', 'cuve'], unit: 'L', displayLabel: 'Capacité' },
    { labels: ['couple max', 'couple'], unit: 'Nm', displayLabel: 'Couple' },
    { labels: ['diamètre', 'disque'], unit: 'mm', displayLabel: 'Diamètre' },
    { labels: ['vitesse', 'rotation'], unit: 'tr/min', displayLabel: 'Vitesse' },
    { labels: ['poids'], unit: 'kg', displayLabel: 'Poids' },
    { labels: ['energie', 'énergie', 'impact'], unit: 'J', displayLabel: 'Énergie' },
    { labels: ['classe'], unit: '', displayLabel: 'Classe' },
  ];

  for (const hero of heroSpecs) {
    if (grid.length >= 3) break;
    const found = specs.find(s =>
      hero.labels.some(l => s.label.toLowerCase().includes(l))
    );
    if (found && !grid.some(g => g.label === hero.displayLabel)) {
      grid.push({ label: hero.displayLabel, value: found.value });
    }
  }

  // 3. Fallback: extract from title/description
  if (grid.length < 3) {
    const capacityMatch = text.match(/(\d+)\s*L(?:ITRES?)?\b/);
    if (capacityMatch && !grid.some(g => g.label === 'Capacité')) {
      grid.push({ label: 'Capacité', value: `${capacityMatch[1]} L` });
    }
  }
  if (grid.length < 3) {
    const classMatch = text.match(/CLASSE\s+([LMH])\b/);
    if (classMatch && !grid.some(g => g.label === 'Classe')) {
      grid.push({ label: 'Classe', value: `Classe ${classMatch[1]}` });
    }
  }

  return grid.slice(0, 3);
}

/** Extract key features as bullet points from HTML description */
export function extractKeyFeatures(html: string): string[] {
  if (!html) return [];

  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = text.split(/(?<=\.)\s+/).map(s => s.trim()).filter(s => s.length > 15);

  const features: string[] = [];
  const seenKeys = new Set<string>();
  const seenTexts = new Set<string>();

  const specPatterns: { key: string; pattern: RegExp }[] = [
    { key: 'capacity', pattern: /\d+[.,]?\d*\s*(litres?|L)\b/i },
    { key: 'torque', pattern: /\d+[.,]?\d*\s*(Nm|N\.m)\b/i },
    { key: 'flow', pattern: /\d+[.,]?\d*\s*(L\/min|m³\/h)\b/i },
    { key: 'speed', pattern: /\d+[.,]?\d*\s*(tr\/min|rpm|min-1)\b/i },
    { key: 'hepa', pattern: /filtre\s+HEPA/i },
    { key: 'class', pattern: /classe\s+[LMH]\b/i },
    { key: 'motor', pattern: /(brushless|POWERSTATE)/i },
    { key: 'battery', pattern: /(sans[\s-]fil|autonomie|batterie\s+\d)/i },
    { key: 'diameter', pattern: /(?:jusqu|diamètre).{0,15}\d+\s*mm/i },
    { key: 'weight', pattern: /\d+[.,]?\d*\s*kg\b/i },
  ];

  for (const { key, pattern } of specPatterns) {
    if (seenKeys.has(key) || features.length >= 4) break;

    for (const sentence of sentences) {
      if (pattern.test(sentence) && !seenKeys.has(key)) {
        const cleaned = sentence.length > 120
          ? sentence.substring(0, sentence.lastIndexOf(' ', 120)) + '\u2026'
          : sentence.replace(/\.$/, '');
        // Skip if this exact sentence was already added by a different pattern
        if (seenTexts.has(cleaned)) {
          seenKeys.add(key);
          break;
        }
        features.push(cleaned);
        seenKeys.add(key);
        seenTexts.add(cleaned);
        break;
      }
    }
  }

  return features;
}

/** Parse Shopify HTML into structured sections */
export function parseDescriptionHtml(html: string): {
  intro: string;
  features: string[];
  specsRows: { label: string; value: string }[];
} {
  const intro: string[] = [];
  const features: string[] = [];
  const specsRows: { label: string; value: string }[] = [];

  // Split on <h3> or <h2> tags to separate sections
  const parts = html.split(/<h[23][^>]*>/i);
  const headings = html.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [];

  // First part is always the intro (before any heading)
  if (parts[0]) {
    const cleaned = parts[0].replace(/<br\s*\/?>/gi, '').trim();
    if (cleaned) intro.push(cleaned);
  }

  // Process each headed section
  for (let i = 0; i < headings.length; i++) {
    const headingText = headings[i].replace(/<[^>]+>/g, '').trim().toLowerCase();
    const content = parts[i + 1] || '';

    if (headingText.includes('caract') || headingText.includes('points')) {
      const liMatches = content.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
      for (const li of liMatches) {
        const text = li.replace(/<[^>]+>/g, '').trim();
        if (text) features.push(text);
      }
    } else if (headingText.includes('sp') && headingText.includes('cif')) {
      const rowMatches = content.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      for (const row of rowMatches) {
        const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
        if (cells.length >= 2 && cells[0] && cells[1]) {
          const label = cells[0].replace(/<[^>]+>/g, '').trim();
          const value = cells[1].replace(/<[^>]+>/g, '').trim();
          if (label && value) specsRows.push({ label, value });
        }
      }
    }
  }

  return { intro: intro.join(''), features, specsRows };
}

/** Parse product title into main title and model reference */
export function parseProductTitle(
  productTitle: string,
  selectedVariantTitle?: string | null
): { mainTitle: string; modelRef: string | null } {
  const titleParts = productTitle.split(' - ');
  const firstTitlePart = titleParts[0].trim();
  const isModelCode = titleParts.length > 1 && /^[A-Z0-9 .\-]+$/.test(firstTitlePart);
  const mainTitle = isModelCode ? titleParts.slice(1).join(' - ').trim() : productTitle;

  const strippedCode = isModelCode
    ? firstTitlePart
        .replace(/^(?:M(?:18|12|4)\s*(?:FUEL™?\s*)?|MX\s*FUEL™?\s*)/i, '')
        .trim()
    : null;
  const titleModelRef = strippedCode && !/\s/.test(strippedCode)
    ? strippedCode.replace(/-\d*[A-Z]*$/, '') || null
    : null;

  const variantTitle = selectedVariantTitle && selectedVariantTitle !== 'Default Title'
    ? selectedVariantTitle
    : null;

  return {
    mainTitle,
    modelRef: titleModelRef || variantTitle,
  };
}
