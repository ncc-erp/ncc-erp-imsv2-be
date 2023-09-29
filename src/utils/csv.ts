const convertToCSV = <T extends Record<string, unknown>>(data: T[]): string => {
  if (data.length === 0) {
    return '';
  }

  const csvData: string[] = [];
  const headers = Object.keys(data[0]);
  csvData.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => convertToString(row[header]));
    csvData.push(values.join(','));
  }

  return csvData.join('\r\n');
};

function convertToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'object' && typeof value.toString !== 'function') {
    return JSON.stringify(value);
  }

  return value.toString();
}

export { convertToCSV };
