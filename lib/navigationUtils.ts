export function getCategoryHoverClass(category: string) {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('mundo')) return 'hover:text-cat-mundo';
  if (cat.includes('argentina')) return 'hover:text-cat-argentina';
  if (cat.includes('tecnolog')) return 'hover:text-cat-tecnologia';
  if (cat.includes('econom')) return 'hover:text-cat-economia';
  if (cat.includes('deport')) return 'hover:text-cat-deportes';
  if (cat.includes('ciencia') || cat.includes('cultur') || cat.includes('ciencias')) return 'hover:text-cat-cultura';
  return 'hover:text-primary';
}
