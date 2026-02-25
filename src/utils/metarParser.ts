import { ParsedMETAR, CloudLayer } from '../types';

export function parseMETARFile(content: string): ParsedMETAR[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: ParsedMETAR[] = [];

  for (const line of lines) {
    const parsed = parseMETARLine(line);
    if (parsed) results.push(parsed);
  }

  return results;
}

export function parseMETARLine(raw: string): ParsedMETAR | null {
  const rawTokens = raw.trim().split(/\s+/);
  const tokens =
    rawTokens[0] === 'METAR' || rawTokens[0] === 'SPECI'
      ? rawTokens.slice(1)
      : rawTokens;
  if (tokens.length < 3) return null;

  const icao = tokens[0];
  if (!/^EH[A-Z]{2}$/.test(icao)) return null;

  // Find datetime token DDHHmmZ
  const dtToken = tokens.find((t) => /^\d{6}Z$/.test(t));
  if (!dtToken) return null;

  const day = parseInt(dtToken.slice(0, 2), 10);
  const hour = parseInt(dtToken.slice(2, 4), 10);
  const minute = parseInt(dtToken.slice(4, 6), 10);

  // Use current year/month as base, actual date will be approximate
  const now = new Date();
  const datetime = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), day, hour, minute, 0)
  );

  // Visibility
  let visibility = 9999;
  for (const token of tokens) {
    if (token === 'CAVOK') {
      visibility = 9999;
      break;
    }
    if (/^\d{4}$/.test(token) && !token.endsWith('Z')) {
      const v = parseInt(token, 10);
      if (v <= 9999) {
        visibility = v;
        break;
      }
    }
    if (/^\d{4}(N|NE|E|SE|S|SW|W|NW)$/.test(token)) {
      visibility = parseInt(token.slice(0, 4), 10);
    }
  }

  // Clouds
  const clouds: CloudLayer[] = [];
  for (const token of tokens) {
    const match = token.match(/^(FEW|SCT|BKN|OVC)(\d{3})/);
    if (match) {
      clouds.push({
        type: match[1] as CloudLayer['type'],
        height: parseInt(match[2], 10) * 100,
      });
    }
  }

  return { icao, datetime, visibility, clouds, raw };
}

export function parseMETARFileWithDates(content: string, referenceYear: number, referenceMonth: number): ParsedMETAR[] {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: ParsedMETAR[] = [];

  for (const line of lines) {
    const parsed = parseMETARLineWithDate(line, referenceYear, referenceMonth);
    if (parsed) results.push(parsed);
  }

  return results;
}

function parseMETARLineWithDate(raw: string, year: number, month: number): ParsedMETAR | null {
  const rawTokens = raw.trim().split(/\s+/);
  const tokens =
    rawTokens[0] === 'METAR' || rawTokens[0] === 'SPECI'
      ? rawTokens.slice(1)
      : rawTokens;
  if (tokens.length < 3) return null;

  const icao = tokens[0];
  if (!/^EH[A-Z]{2}$/.test(icao)) return null;

  const dtToken = tokens.find((t) => /^\d{6}Z$/.test(t));
  if (!dtToken) return null;

  const day = parseInt(dtToken.slice(0, 2), 10);
  const hour = parseInt(dtToken.slice(2, 4), 10);
  const minute = parseInt(dtToken.slice(4, 6), 10);

  const datetime = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  let visibility = 9999;
  for (const token of tokens) {
    if (token === 'CAVOK') { visibility = 9999; break; }
    if (/^\d{4}$/.test(token) && !token.endsWith('Z')) {
      const v = parseInt(token, 10);
      if (v <= 9999) { visibility = v; break; }
    }
  }

  const clouds: CloudLayer[] = [];
  for (const token of tokens) {
    const match = token.match(/^(FEW|SCT|BKN|OVC)(\d{3})/);
    if (match) {
      clouds.push({ type: match[1] as CloudLayer['type'], height: parseInt(match[2], 10) * 100 });
    }
  }

  return { icao, datetime, visibility, clouds, raw };
}
