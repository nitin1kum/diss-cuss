export function calculateTime(data : Date) {
  const now = new Date();
  const diff = now.getTime() - data.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
}

export function calculateRunTime(time : number){

  const hour = Math.floor(time/60);
  const minute = time%60;

  return `${hour.toString() }h ${minute.toString()}min`;
}

export function calculateLikes(likes : number){
  if (likes >= 1_000_000_000) {
    return (likes / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
  } else if (likes >= 1_000_000) {
    return (likes / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (likes >= 1_000) {
    return (likes / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    return likes.toString();
  }
}

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
