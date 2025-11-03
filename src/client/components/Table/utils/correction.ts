import { ExtendedColumn } from '../types';

export function correctRow(columns: ExtendedColumn[], row: any) {
	const reviewedRow: { [key: string]: any } = {};

	for (const column of columns) {
		if (column.error && column.error.type === 'mismatch') {
			// `as string` overwrite `string?` type because if error.type is "mismatch" then target is always defined
			reviewedRow[column.prop] = row[column.error.target as string];
			continue;
		}

		reviewedRow[column.prop] = row[column.prop];
	}

	return reviewedRow;
}

export function correctRows(columns: ExtendedColumn[], data: any[]) {
	const result: any[] = [];

	for (const row of data) {
		result.push(correctRow(columns, row));
	}

	return result;
}