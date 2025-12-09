// src/common/CommonExcelExport.tsx
import * as XLSX from "xlsx";
 
/**
 * Exports given JSON data to an Excel (.xlsx) file.
 *
 * @param data - Array of objects (table data)
 * @param fileName - Desired Excel file name (without extension)
 */
export const exportToExcel = (data: Record<string, any>[], fileName: string) => {
  if (!data || data.length === 0) {
    alert("No data available to export!");
    return;
  }
 
  try {
    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
 
    // Create Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    alert("Failed to export Excel file!");
  }
};
 
 