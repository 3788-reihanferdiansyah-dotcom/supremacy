import { useCallback, useMemo, useState } from 'react';
import { recoveredRows } from './recoveredRecords';

export type FeishuTableSdkErrorInfo = { code?: string | number; message?: string };
type SheetData = { rawValues: unknown[][] };
type SheetState = 'idle' | 'loading' | 'success' | 'error';
const STORAGE_KEY = 'anomali-dashboard-records-v1';

function initialRows(): unknown[][] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as unknown[][];
  } catch {
    // Fall back to the recovered public snapshot.
  }
  return recoveredRows.map(row => [...row]);
}

function columnIndex(label: string) {
  return label.toUpperCase().charCodeAt(0) - 65;
}

export function useFeishuSheetRange(_options: { bindingId: string; range: string }) {
  const [rows, setRows] = useState<unknown[][]>(initialRows);
  const [status] = useState<SheetState>('success');

  const persist = useCallback((next: unknown[][]) => {
    setRows(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateRange = useCallback(async ({ range, values }: { range: string; values: unknown[][] }) => {
    const match = /^([A-Z])(\d+):([A-Z])(\d+)$/i.exec(range);
    if (!match) throw new Error(`Rentang tidak valid: ${range}`);
    const [, startColumn, startRow] = match;
    const rowIndex = Number(startRow) - 1;
    const offset = columnIndex(startColumn);
    setRows(current => {
      const next = current.map(row => [...row]);
      while (next.length <= rowIndex) next.push([]);
      values.forEach((inputRow, inputRowIndex) => {
        const target = rowIndex + inputRowIndex;
        while (next.length <= target) next.push([]);
        inputRow.forEach((value, valueIndex) => {
          next[target][offset + valueIndex] = value;
        });
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return useMemo(() => ({
    data: { rawValues: rows } as SheetData,
    status,
    error: undefined as FeishuTableSdkErrorInfo | undefined,
    updateRange,
    reload: async () => undefined,
    reset: () => persist(recoveredRows.map(row => [...row])),
  }), [persist, rows, status, updateRange]);
}
