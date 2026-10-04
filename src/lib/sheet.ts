/**
 * Shared Google Sheet reader.
 *
 * Used at build time by `scripts/fetch-services.ts` and at runtime by the browser
 * appointment script (demo mode). It only uses `fetch` and string parsing so it
 * runs in both environments.
 *
 * The Sheet is a simple table:
 *   id | name | price | duration | available | note
 * `id` matches the service file name. Only `price`, `duration` and `available` are
 * authoritative overrides; everything else falls back to the content collections.
 */

export type ServiceSheetRow = {
  id: string;
  name?: string;
  price?: number;
  duration?: number;
  available?: boolean;
  note?: string;
};

export type ServiceSheet = Record<string, ServiceSheetRow>;

/** CSV URL for a link-shared/published Sheet (Google Visualization endpoint). */
export function getSheetCsvUrl(sheetId: string, tab: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    tab,
  )}`;
}

/** Minimal RFC-4180-ish CSV parser (handles quoted fields and embedded commas). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAvailable(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const normalised = value.trim().toLowerCase();
  if (normalised === "") return undefined;
  return ["yes", "y", "true", "1", "available", "in stock"].includes(
    normalised,
  );
}

/** Parse a service CSV export into rows keyed by service id. Unknown columns are ignored. */
export function parseServiceSheet(text: string): ServiceSheet {
  const rows = parseCsv(text);
  if (rows.length < 2) return {};

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const column = (name: string) => header.indexOf(name);

  const idCol = column("id");
  if (idCol === -1) return {};

  const nameCol = column("name");
  const priceCol = column("price");
  const durationCol = column("duration");
  const availableCol = column("available");
  const noteCol = column("note");

  const sheet: ServiceSheet = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const id = (row[idCol] ?? "").trim();
    if (!id) continue;

    sheet[id] = {
      id,
      name: nameCol >= 0 ? (row[nameCol] ?? "").trim() || undefined : undefined,
      price: priceCol >= 0 ? parseNumber(row[priceCol]) : undefined,
      duration: durationCol >= 0 ? parseNumber(row[durationCol]) : undefined,
      available:
        availableCol >= 0 ? parseAvailable(row[availableCol]) : undefined,
      note: noteCol >= 0 ? (row[noteCol] ?? "").trim() || undefined : undefined,
    };
  }

  return sheet;
}
