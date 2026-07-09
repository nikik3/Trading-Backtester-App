type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
interface ClassDictionary {
  [id: string]: any;
}
interface ClassArray extends Array<ClassValue> {}

function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  inputs.forEach(input => {
    if (!input) return;
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      classes.push(clsx(...input));
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  });

  return classes.join(' ');
}

// A simplified version of tailwind-merge. Only keeps the last duplicate class.
function twMerge(classString: string): string {
  if (!classString) return '';
  const classList = classString.trim().split(/\s+/);
  const seen: Record<string, number> = {};
  classList.forEach((cls, idx) => { seen[cls] = idx; });
  // get classes in order of last appearance
  return Object.entries(seen)
    .sort((a, b) => a[1] - b[1])
    .map(([cls]) => cls)
    .join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
