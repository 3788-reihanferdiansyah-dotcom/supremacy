export type RecordRow = {
  rowIndex: number;
  date: string;
  airwaybill: string;
  status: string;
  reason: string;
  inputBy: string;
};

export type Severity = 'high' | 'medium' | 'low' | 'noAchieve';

export const SEVERITY_META: Record<
  Severity,
  { label: string; description: string }
> = {
  high: {
    label: 'High',
    description: 'SOLVED, ready return, selesai, atau ditutup; kondisi sehat',
  },
  medium: {
    label: 'Medium',
    description: 'Proses operasional aktif; tetap dipantau',
  },
  low: {
    label: 'Low',
    description: 'Investigasi, aging, DNR, atau salah rute',
  },
  noAchieve: {
    label: 'No Achieve',
    description: 'Hilang, rusak, tercecer, atau klaim',
  },
};

const CRITICAL =
  /\b(lost|damage|damaged|tercecer|claim|paket hilang|hilang|rusak|missing|stolen)\b/i;
const WATCH =
  /\b(dnr|aging|ageing|investigasi|investigation|misroute|salah rute|overdue|breach)\b/i;
const HEALTHY_STATUSES = new Set(['solved', 'ready return']);
const HEALTHY = /\b(closed|selesai|resolved|delivered|success)\b/i;
const PROCESS =
  /\b(return proses|return process|delivery proses|delivery process|aah ehc|pending|process|proses)\b/i;

/**
 * Klasifikasi transparan dan deterministik. Status SOLVED/ready return selalu sehat; untuk kasus lain,
 * kata kunci kritis lalu kata kunci pemantauan menentukan tingkat tindak lanjut.
 */
export function classifyRecord(row: RecordRow): Severity {
  const status = row.status.trim();
  const normalizedStatus = status.toLowerCase();
  const text = `${status} ${row.reason}`.trim();
  if (HEALTHY_STATUSES.has(normalizedStatus) || HEALTHY.test(status))
    return 'high';
  if (CRITICAL.test(text)) return 'noAchieve';
  if (WATCH.test(text)) return 'low';
  if (PROCESS.test(text)) return 'medium';
  return 'medium';
}

export function isOpenCase(row: RecordRow) {
  return classifyRecord(row) !== 'high';
}

export function displayDate(value: unknown) {
  if (typeof value === 'number') {
    const time = value > 1e11 ? value : (value - 25569) * 86400000;
    return new Date(time).toLocaleDateString('id-ID', { timeZone: 'UTC' });
  }
  return String(value ?? '').trim();
}

export function toSheetDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  const epoch = Date.UTC(1899, 11, 30);
  return (Date.UTC(year, month - 1, day) - epoch) / 86400000;
}

export function topLabels(
  rows: RecordRow[],
  severities: Severity[],
  limit = 5,
) {
  const counts = new Map<string, number>();
  rows.forEach(row => {
    if (!severities.includes(classifyRecord(row))) return;
    const label = row.status || row.reason || 'Tanpa status';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label]) => label);
}
