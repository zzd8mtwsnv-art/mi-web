/**
 * Intelligent topic / block parser for StudyFlow Planner
 * Parses natural language input such as:
 * - "Tengo 15 apartados" -> ["Apartado 1", "Apartado 2", ..., "Apartado 15"]
 * - "Tengo 8 temas" -> ["Tema 1", "Tema 2", ..., "Tema 8"]
 * - "Capítulos 1 al 6" -> ["Capítulo 1", "Capítulo 2", ..., "Capítulo 6"]
 * - "del 1 al 10" -> ["Bloque 1", ..., "Bloque 10"]
 * - "Tema 1: Cinemática, Tema 2: Dinámica, Tema 3: Energía" -> preserves full topic items
 * - "MRU, MRUA, caída libre, tiro parabólico" -> ["MRU", "MRUA", "caída libre", "tiro parabólico"]
 * - Numbered/bulleted lists with linebreaks
 */

export function parseTopicsIntelligently(rawInput: string): string[] {
  if (!rawInput || typeof rawInput !== 'string') {
    return [];
  }

  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // 1. Check for single quantity pattern like "Tengo 15 apartados", "Son 8 temas", "12 temas", "15 apartados"
  const countRegex = /(?:tengo|son|hay|entran)?\s*(\d{1,3})\s*(apartados?|temas?|cap[ií]tulos?|unidades?|bloques?|lecciones?|ejercicios?|problemas?|puntos?|secciones?)\b/i;
  const countMatch = trimmed.match(countRegex);

  // Check if it's primarily a count statement (e.g. input is short and doesn't contain multiple comma-separated items)
  if (countMatch && !trimmed.includes(',') && !trimmed.includes('\n') && !trimmed.includes(';')) {
    const count = parseInt(countMatch[1], 10);
    const rawUnit = countMatch[2].toLowerCase();

    if (count > 0 && count <= 100) {
      let singularUnit = 'Tema';
      if (rawUnit.startsWith('apartad')) singularUnit = 'Apartado';
      else if (rawUnit.startsWith('tem')) singularUnit = 'Tema';
      else if (rawUnit.startsWith('cap')) singularUnit = 'Capítulo';
      else if (rawUnit.startsWith('unid')) singularUnit = 'Unidad';
      else if (rawUnit.startsWith('bloq')) singularUnit = 'Bloque';
      else if (rawUnit.startsWith('lecc')) singularUnit = 'Lección';
      else if (rawUnit.startsWith('ejerc')) singularUnit = 'Ejercicio';
      else if (rawUnit.startsWith('probl')) singularUnit = 'Problema';
      else if (rawUnit.startsWith('secc')) singularUnit = 'Sección';
      else if (rawUnit.startsWith('punt')) singularUnit = 'Punto';

      return Array.from({ length: count }, (_, i) => `${singularUnit} ${i + 1}`);
    }
  }

  // 2. Check for range pattern like "Capítulos 1 al 6", "temas del 1 al 8", "apartados 3 al 10", "del 1 al 10"
  const rangeRegex = /(?:(apartados?|temas?|cap[ií]tulos?|unidades?|bloques?|lecciones?|ejercicios?|problemas?)\s+)?(?:del\s+)?(\d{1,3})\s*(?:al?|-|hasta)\s*(\d{1,3})\b/i;
  const rangeMatch = trimmed.match(rangeRegex);

  if (rangeMatch && !trimmed.includes(',') && !trimmed.includes('\n') && !trimmed.includes(';')) {
    const rawUnit = rangeMatch[1]?.toLowerCase() || 'bloque';
    const startNum = parseInt(rangeMatch[2], 10);
    const endNum = parseInt(rangeMatch[3], 10);

    if (startNum >= 0 && endNum >= startNum && (endNum - startNum) <= 100) {
      let singularUnit = 'Bloque';
      if (rawUnit.startsWith('apartad')) singularUnit = 'Apartado';
      else if (rawUnit.startsWith('tem')) singularUnit = 'Tema';
      else if (rawUnit.startsWith('cap')) singularUnit = 'Capítulo';
      else if (rawUnit.startsWith('unid')) singularUnit = 'Unidad';
      else if (rawUnit.startsWith('bloq')) singularUnit = 'Bloque';
      else if (rawUnit.startsWith('lecc')) singularUnit = 'Lección';
      else if (rawUnit.startsWith('ejerc')) singularUnit = 'Ejercicio';
      else if (rawUnit.startsWith('probl')) singularUnit = 'Problema';

      const items: string[] = [];
      for (let i = startNum; i <= endNum; i++) {
        items.push(`${singularUnit} ${i}`);
      }
      return items;
    }
  }

  // 3. Multiline or delimiter-separated parser (commas, semicolons, newlines, bullet points, numbers)
  // First split by line breaks or semicolons
  const lines = trimmed.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);

  const parsedItems: string[] = [];

  for (const line of lines) {
    // If line has comma-separated items (e.g. "Tema 1: Cinemática, Tema 2: Dinámica, Tema 3: Energía" or "MRU, MRUA, caída libre, tiro parabólico")
    if (line.includes(',')) {
      const parts = line.split(',').map((p) => cleanTopicString(p)).filter(Boolean);
      parsedItems.push(...parts);
    } else {
      const cleanLine = cleanTopicString(line);
      if (cleanLine) {
        parsedItems.push(cleanLine);
      }
    }
  }

  return parsedItems.length > 0 ? parsedItems : [trimmed];
}

/**
 * Cleans markdown bullets, numbering, and trailing punctuation
 */
function cleanTopicString(str: string): string {
  if (!str) return '';
  // Remove leading bullets like "- ", "* ", "• ", "1. ", "1) "
  let cleaned = str.trim().replace(/^[-*•\d]+[.)]\s*/, '').trim();
  // Remove trailing commas, dots, semicolons
  cleaned = cleaned.replace(/[,;]+$/, '').trim();
  return cleaned || str.trim();
}
