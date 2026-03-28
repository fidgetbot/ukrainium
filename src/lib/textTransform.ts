/**
 * Transform word for display:
 * - ALL CAPS words → lowercase
 * - Mixed case/proper nouns → stay as-is
 * Examples: "TRUE" → "true", "ПРАВДА" → "правда", "I'll" → "I'll", "God" → "God"
 */
export function transformForDisplay(text: string): string {
  if (!text) return text;
  
  // Check if word is ALL CAPS (English) or all caps Cyrillic
  const isAllCaps = /^[A-Z\u0400-\u042F]+$/.test(text);
  
  if (isAllCaps) {
    return text.toLowerCase();
  }
  
  // Otherwise keep as-is (proper nouns, contractions, etc.)
  return text;
}
