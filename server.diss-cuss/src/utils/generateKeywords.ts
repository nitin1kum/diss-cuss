export function generateKeywords(name: string): string[] {
  const base = name.trim().toLowerCase();
  const words = base.split(/\s+/).filter(Boolean);

  const keywords = new Set<string>();

  // Add base name variations
  keywords.add(base);
  keywords.add(`${base} movie`);
  keywords.add(`${base} discussion`);
  keywords.add(`discuss ${base}`);
  keywords.add(`talk about ${base}`);
  keywords.add(`${base} fans`);
  keywords.add(`${base} review`);
  keywords.add(`${base} comments`);

  // Add individual word variations (e.g. for "The Matrix")
  for (const word of words) {
    keywords.add(`${word} movie`);
    keywords.add(`${word} discussion`);
  }

  return Array.from(keywords);
}