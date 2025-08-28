
import * as ExcelJS from 'exceljs';
import type { ImportData } from '@/types/import';

export const parseExcelFile = async (file: File): Promise<ImportData> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = async (e) => {
			try {
				const buffer = e.target?.result as ArrayBuffer;
				const workbook = new ExcelJS.Workbook();
				await workbook.xlsx.load(buffer);
				
				// Prendre la première feuille
				const worksheet = workbook.worksheets[0];
				
				if (!worksheet) {
					throw new Error("Aucune feuille trouvée dans le fichier Excel");
				}
				
				const jsonData: string[][] = [];
				
				worksheet.eachRow((row, rowNumber) => {
					const rowData: string[] = [];
					row.eachCell((cell, colNumber) => {
						// Convertir toutes les valeurs en string
						const value = cell.value;
						if (value === null || value === undefined) {
							rowData[colNumber - 1] = '';
						} else if (typeof value === 'object' && 'richText' in value) {
							// Gérer le texte riche
							rowData[colNumber - 1] = value.richText?.map((rt: any) => rt.text).join('') || '';
						} else {
							rowData[colNumber - 1] = String(value);
						}
					});
					jsonData.push(rowData);
				});
				
				if (jsonData.length === 0) {
					throw new Error("Le fichier Excel est vide");
				}
				
				const [headers, ...rows] = jsonData;
				
				if (!headers || headers.length === 0) {
					throw new Error("Aucun en-tête trouvé dans le fichier");
				}
				
				// Nettoyer les données (supprimer les lignes vides)
				const cleanRows = rows.filter(row => 
					row && row.some(cell => cell !== undefined && cell !== null && cell !== '')
				);
				
				resolve({
					fileName: file.name,
					fileType: 'excel',
					headers: headers.map(h => String(h || '')),
					rows: cleanRows.map(row => 
						headers.map((_, index) => String(row[index] || ''))
					),
					totalRows: cleanRows.length
				});
				
			} catch (error) {
				reject(new Error(`Erreur lors de l'analyse du fichier Excel: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
			}
		};
		
		reader.onerror = () => {
			reject(new Error("Erreur lors de la lecture du fichier"));
		};
		
		reader.readAsArrayBuffer(file);
	});
};

export const parseCSVFile = async (file: File): Promise<ImportData> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = (e) => {
			try {
				const text = e.target?.result as string;
				
				if (!text.trim()) {
					throw new Error("Le fichier CSV est vide");
				}
				
				// Détecter le séparateur (virgule ou point-virgule)
				const commaCount = (text.match(/,/g) || []).length;
				const semicolonCount = (text.match(/;/g) || []).length;
				const separator = semicolonCount > commaCount ? ';' : ',';
				
				// Parser le CSV
				const lines = text.split('\n').map(line => line.trim()).filter(line => line);
				
				if (lines.length === 0) {
					throw new Error("Aucune ligne trouvée dans le fichier CSV");
				}
				
				const parseCSVLine = (line: string): string[] => {
					const result: string[] = [];
					let current = '';
					let inQuotes = false;
					
					for (let i = 0; i < line.length; i++) {
						const char = line[i];
						
						if (char === '"') {
							inQuotes = !inQuotes;
						} else if (char === separator && !inQuotes) {
							result.push(current.trim());
							current = '';
						} else {
							current += char;
						}
					}
					
					result.push(current.trim());
					return result;
				};
				
				const [headerLine, ...dataLines] = lines;
				const headers = parseCSVLine(headerLine);
				
				if (!headers || headers.length === 0) {
					throw new Error("Aucun en-tête trouvé dans le fichier CSV");
				}
				
				const rows = dataLines
					.map(line => parseCSVLine(line))
					.filter(row => row.some(cell => cell.trim() !== ''))
					.map(row => {
						// Assurer que chaque ligne a le même nombre de colonnes que les headers
						const normalizedRow = [...row];
						while (normalizedRow.length < headers.length) {
							normalizedRow.push('');
						}
						return normalizedRow.slice(0, headers.length);
					});
				
				resolve({
					fileName: file.name,
					fileType: 'csv',
					headers: headers.map(h => h.replace(/^["']|["']$/g, '')), // Supprimer les guillemets
					rows,
					totalRows: rows.length
				});
				
			} catch (error) {
				reject(new Error(`Erreur lors de l'analyse du fichier CSV: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
			}
		};
		
		reader.onerror = () => {
			reject(new Error("Erreur lors de la lecture du fichier"));
		};
		
		reader.readAsText(file, 'UTF-8');
	});
};
