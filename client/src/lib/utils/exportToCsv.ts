/**
 * Utility function to convert data to CSV format and trigger download
 * @param data Array of objects to convert to CSV
 * @param filename Filename without extension
 */
export function exportToCsv(data: any[], filename: string) {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle string values and escape commas and quotes
      const escaped = typeof value === 'string' 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
      return escaped;
    });
    csvRows.push(values.join(','));
  }
  
  // Create blob and download link
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // Browser supports HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fallback for older browsers
    window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
  }
}
