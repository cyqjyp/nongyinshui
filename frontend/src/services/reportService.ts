import * as XLSX from 'xlsx';

/**
 * Generic export-to-Excel helper. Accepts a sheet name and an array of
 * plain-object rows (as produced by the report page's data assembly).
 * In the future this can be swapped for a server-generated file download
 * without changing the calling report pages.
 */
export function exportToExcel(rows: Record<string, unknown>[], sheetName: string, fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/** Opens the browser print dialog scoped to a printable report container, which
 * reliably renders Chinese text and is the most practical way to produce a PDF
 * without bundling CJK-capable PDF fonts for a demo build. */
export function printAsPdf() {
  window.print();
}
