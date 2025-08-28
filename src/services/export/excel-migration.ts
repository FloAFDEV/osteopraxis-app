import * as ExcelJS from 'exceljs';

/**
 * Service de migration XLSX vers ExcelJS
 * Remplace les fonctionnalités de xlsx par exceljs
 */

export interface ExcelData {
  headers: string[];
  rows: (string | number | null)[][];
}

/**
 * Lit un fichier Excel et retourne les données
 * Remplace XLSX.read + sheet_to_json
 */
export const readExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        
        await workbook.xlsx.load(buffer);
        
        // Prendre la première feuille
        const worksheet = workbook.getWorksheet(1);
        
        if (!worksheet) {
          throw new Error("Le fichier Excel est vide ou n'a pas de feuille");
        }
        
        const rows: (string | number | null)[][] = [];
        let headers: string[] = [];
        
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          const rowData: (string | number | null)[] = [];
          
          row.eachCell({ includeEmpty: true }, (cell) => {
            let value = cell.value;
            
            // Gérer les différents types de valeurs
            if (value === null || value === undefined) {
              value = null;
            } else if (typeof value === 'object' && 'text' in value) {
              // Cellule avec texte riche
              value = (value as any).text;
            } else if (value instanceof Date) {
              value = value.toISOString().split('T')[0]; // Format YYYY-MM-DD
            }
            
            rowData.push(value as string | number | null);
          });
          
          if (rowNumber === 1) {
            headers = rowData.map(cell => String(cell || ''));
          } else {
            rows.push(rowData);
          }
        });
        
        resolve({ headers, rows });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Crée un fichier Excel à partir de données
 * Remplace XLSX.utils.aoa_to_sheet + writeFile
 */
export const createExcelFile = async (
  data: (string | number | null)[][], 
  sheetName: string = 'Sheet1',
  filename?: string
): Promise<Blob> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  // Ajouter les données
  data.forEach((row, index) => {
    worksheet.addRow(row);
    
    // Styling pour la première ligne (headers)
    if (index === 0) {
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }
  });
  
  // Auto-ajuster la largeur des colonnes
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    
    if (column.eachCell) {
      column.eachCell({ includeEmpty: false }, (cell) => {
        const cellLength = String(cell.value || '').length;
        maxLength = Math.max(maxLength, cellLength);
      });
    }
    
    column.width = Math.min(maxLength + 2, 50);
  });
  
  // Générer le buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};

/**
 * Télécharge un fichier Excel
 * Remplace XLSX.writeFile
 */
export const downloadExcelFile = async (
  data: (string | number | null)[][], 
  filename: string,
  sheetName: string = 'Sheet1'
): Promise<void> => {
  const blob = await createExcelFile(data, sheetName);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Convertit des données JSON en format tableau
 * Remplace sheet_to_json avec header: 1
 */
export const jsonToArray = (data: Record<string, any>[], headers?: string[]): (string | number | null)[][] => {
  if (data.length === 0) return [];
  
  const keys = headers || Object.keys(data[0]);
  const result: (string | number | null)[][] = [keys];
  
  data.forEach(row => {
    const rowData = keys.map(key => row[key] ?? null);
    result.push(rowData);
  });
  
  return result;
};

/**
 * Convertit un tableau en format JSON
 * Inverse de jsonToArray
 */
export const arrayToJson = (data: (string | number | null)[][]): Record<string, any>[] => {
  if (data.length === 0) return [];
  
  const [headers, ...rows] = data;
  
  return rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[String(header)] = row[index];
    });
    return obj;
  });
};