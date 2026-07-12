export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export function parseGuestCsv(text: string): { name: string; email?: string }[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const firstRow = parseCsvLine(lines[0]);
  let nameIndex = -1;
  let emailIndex = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const header = firstRow[i].toLowerCase().trim();
    if (header === 'name' || header === 'guest name' || header === 'invitee') {
      nameIndex = i;
    } else if (header === 'email' || header === 'email address') {
      emailIndex = i;
    }
  }

  let startIndex = 1;
  if (nameIndex === -1) {
    nameIndex = 0;
    emailIndex = firstRow.length > 1 ? 1 : -1;
    startIndex = 0;
  }

  const records: { name: string; email?: string }[] = [];
  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[nameIndex]?.trim();
    if (name) {
      const email = emailIndex !== -1 ? cols[emailIndex]?.trim() : undefined;
      records.push({
        name,
        email: email || undefined,
      });
    }
  }

  return records;
}
