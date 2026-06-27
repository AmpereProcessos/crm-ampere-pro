import * as XLSX from "xlsx";

type ExcelSheet = {
	name: string;
	data: Record<string, unknown>[];
};

const EXCEL_SHEET_NAME_MAX_LENGTH = 31;
const INVALID_SHEET_NAME_CHARS = /[:\\/?*[\]]/g;

function sanitizeExcelSheetName(name: string): string {
	const sanitized = (name || "Sem nome").replace(INVALID_SHEET_NAME_CHARS, "").slice(0, EXCEL_SHEET_NAME_MAX_LENGTH).trim();
	return sanitized || "Aba";
}

function getUniqueSheetName(baseName: string, usedNames: Set<string>): string {
	if (!usedNames.has(baseName)) {
		usedNames.add(baseName);
		return baseName;
	}

	let counter = 2;
	while (counter < 100) {
		const suffix = ` (${counter})`;
		const truncated = baseName.slice(0, EXCEL_SHEET_NAME_MAX_LENGTH - suffix.length) + suffix;
		if (!usedNames.has(truncated)) {
			usedNames.add(truncated);
			return truncated;
		}
		counter += 1;
	}

	const fallback = `${baseName.slice(0, 28)}...`;
	usedNames.add(fallback);
	return fallback;
}

export function getExcelBufferFromSheets(sheets: ExcelSheet[]): Buffer {
	const workbook = XLSX.utils.book_new();
	const usedNames = new Set<string>();

	for (const sheet of sheets) {
		const sheetName = getUniqueSheetName(sanitizeExcelSheetName(sheet.name), usedNames);
		const worksheet = XLSX.utils.json_to_sheet(sheet.data);
		XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
	}

	return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}

export const getJSONFromExcelFile = (file: File): Promise<any[]> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = e.target?.result as string;
				const workbook = XLSX.read(data, { type: "binary" });
				const sheetName = workbook.SheetNames[0];
				const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
				resolve(jsonData);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = (error) => reject(error);

		reader.readAsBinaryString(file);
	});
};
export const getExcelFromJSON = (jsonData: any[], fileName: string): void => {
	const worksheet = XLSX.utils.json_to_sheet(jsonData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

	const excelData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

	// Create a Blob containing the Excel file
	const blob = new Blob([excelData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

	// Create a download link and trigger a click event to download the file
	const downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = fileName;
	downloadLink.click();
};
export function getFixedDateFromExcel(date: number) {
	return new Date(Math.round((date - 25569) * 86400 * 1000));
}
