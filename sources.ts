type SheetRangeBinding = {
  bindingId: string;
  resourceType: 'sheetRange';
  spreadsheetToken: string;
  sheetId?: string;
};

const BINDING: SheetRangeBinding = {
  bindingId: 'airwaybillRecords',
  resourceType: 'sheetRange',
  spreadsheetToken: 'I9fXs5b1AhLBTWtJk6NlRUXAgQc',
  sheetId: '4c15f8',
};
const FEISHU_HOST = 'https://bytedance.larkoffice.com';

export function findBinding(bindingId: string) {
  return bindingId === BINDING.bindingId ? BINDING : undefined;
}

export function feishuResourceUrl(binding: SheetRangeBinding | undefined) {
  if (!binding) return undefined;
  return `${FEISHU_HOST}/sheets/${binding.spreadsheetToken}${binding.sheetId ? `?sheet=${binding.sheetId}` : ''}`;
}

export function sourceUrl() {
  return feishuResourceUrl(findBinding('airwaybillRecords'));
}
