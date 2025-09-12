import { RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Column, ExtendedColumn, TableHandle } from '../types';
import { misspelled } from '../utils/mispelled';

interface useTableProps {
	allowMismatch: boolean;
	columns: Column[];
	data: any[];
	uniqueValueColumn: string;
	ref?: RefObject<TableHandle>;
	pagination?: boolean | number;
}

export type SortByType = {
	prop: string;
	order: 'asc' | 'desc';
};

export default function useTable({ allowMismatch, columns, data, pagination, uniqueValueColumn, ref }: useTableProps) {
	const [localData, setLocalData] = useState(data);
	const [sortBy, setSortBy] = useState<SortByType | null>(null);

	// Reupdate localData when data from parent component (via props) changed
	useEffect(() => {
		setLocalData(data);
	}, [data]);

	const sortedData = useMemo(() => {
		if (!sortBy) {
			return localData;
		}

		const collator = Intl.Collator('fr-FR', {
			ignorePunctuation: true,
			numeric: true,
			sensitivity: 'base',
		});

		if (sortBy.order === 'desc') {
			return localData.toSorted((a, b) => collator.compare(b[sortBy.prop], a[sortBy.prop]));
		}

		return localData.toSorted((a, b) => collator.compare(a[sortBy.prop], b[sortBy.prop]));
	}, [localData, sortBy]);

	// Applying pagination if enabled
	const [page, setPage] = useState(1);
	const slicedData = useMemo<any[] | any[][]>(() => {
		if (!pagination) return sortedData;

		const result = [];

		const size = typeof pagination === 'number' ? pagination : 100;

		for (let i = 0; i < sortedData.length; i += size) {
			result.push(sortedData.slice(i, i + size));
		}

		return result;
	}, [pagination, sortedData]);

	const displayedData = useMemo<any[]>(() => {
		if (!pagination) return slicedData;

		return slicedData[page - 1];
	}, [page, pagination, slicedData]);

	// --- Actions ---

	const updateData = useCallback(
		(id: any, prop: string, value: any) => {
			setLocalData((prev) => {
				const index = prev.findIndex((x) => x[uniqueValueColumn] === id);
				if (index === -1) return prev;

				const newRow = {
					...prev[index],
					[prop]: value,
				};

				return prev.toSpliced(index, 1, newRow);
			});
		},
		[uniqueValueColumn]
	);

	const deleteRow = useCallback(
		(id: any) => {
			setLocalData((prev) => {
				const index = prev.findIndex((x) => x[uniqueValueColumn] === id);
				if (index === -1) return prev;
				return prev.toSpliced(index, 1);
			});
		},
		[uniqueValueColumn]
	);

	const updateColumn = useCallback((oldColumn: string, newColumn: string) => {
		setLocalData((prev) => {
			const result = [];

			for (const row of prev) {
				const newRow = {
					...row,
					[newColumn]: row[oldColumn],
				};

				delete newRow[oldColumn];

				result.push(newRow);
			}

			return result;
		});
	}, []);

	const deleteColumn = useCallback((prop: string) => {
		setLocalData((prev) => {
			return prev.map((row) => {
				delete row[prop];
				return row;
			});
		});
	}, []);

	const reviewedColumns: ExtendedColumn[] = useMemo(() => {
		if (!allowMismatch) return columns;

		const dataColumns = new Set<string>();

		//* Get columns from data
		for (const row of localData) {
			for (const column of Object.keys(row)) {
				if (column === 'warnings' || dataColumns.has(column)) continue;
				if (column === uniqueValueColumn && columns.findIndex((x) => x.prop === uniqueValueColumn) === -1)
					continue;

				dataColumns.add(column);
			}
		}

		const result: ExtendedColumn[] = [...columns];
		const remainingColumns = [];

		//* Detect all correct columns
		for (const column of columns) {
			if (dataColumns.has(column.prop)) {
				dataColumns.delete(column.prop);

				const values = localData.map((x) => x[column.prop]);
				if (values.every((x) => !x)) {
					remainingColumns.push(column);
				}

				continue;
			}

			remainingColumns.push(column);
		}

		//* For every remaining columns (from data) which are not exactly correct with the models (columns variable)
		//* Try to use the misspell function
		const model = remainingColumns.reduce(
			(acc, cur) => {
				acc[cur.prop] = undefined;
				return acc;
			},
			{} as { [key: string]: any }
		);
		const misspellInput = [...dataColumns].reduce(
			(acc, cur) => {
				acc[cur] = cur;
				return acc;
			},
			{} as { [key: string]: any }
		);

		const { correction } = misspelled.check([misspellInput], model);

		//* Add all corrected columns
		for (const [newColumn, oldColumn] of Object.entries(correction)) {
			const colIndex = result.findIndex((x) => x.prop === newColumn);

			const obj = {
				...result[colIndex],
				error: {
					type: 'mismatch',
					target: oldColumn,
					columns: remainingColumns,
				},
			};

			result.splice(colIndex, 1, obj);

			//* Remove oldColumn e.g: typeSiet from dataColumns to prevent it to be showed twice
			dataColumns.delete(oldColumn);

			//* Also remove the matchedColumn (newColumn var) from remainingColumns
			const index = remainingColumns.findIndex((x) => x.prop === newColumn);
			if (index > -1) {
				remainingColumns.splice(index, 1);
			}
		}

		for (const column of [...dataColumns]) {
			result.push({
				label: column,
				prop: column,
				type: 'text',
				editable: false,
				allowNull: true,
				error: { type: 'not-found', columns: remainingColumns },
			});
		}

		return result;
	}, [allowMismatch, columns, localData, uniqueValueColumn]);

	// --------------------------------------------------- Custom ref ------------------------------------------------------
	const getData = useCallback(() => {
		const validData = [];
		if (!reviewedColumns.some((x) => Object.hasOwn(x, 'error') && x.error?.type !== 'mismatch')) {
			for (const row of localData) {
				if (!Object.hasOwn(row, 'warnings')) {
					validData.push(row);
				}
			}
		}

		const errorOnNull = new Map();
		const errorOnUnique = new Map();
		const errorOnOthers = new Map();

		for (const column of reviewedColumns) {
			const prop = column.error?.type === 'mismatch' && column.error.target ? column.error.target : column.prop;

			for (const row of localData) {
				if (!(column.allowNull ?? true) && !row[prop] && !errorOnNull.has(row[uniqueValueColumn])) {
					errorOnNull.set(row[uniqueValueColumn], row);
				}

				if (column.unique) {
					const matches = localData.filter((x) => x[prop] === row[prop]).length;

					if (matches > 1 && !errorOnUnique.has(row[uniqueValueColumn])) {
						errorOnUnique.set(row[uniqueValueColumn], row);
					}
				}

				if (typeof column.validate === 'function') {
					if (column.validate(row[prop]) && !errorOnOthers.has(row[uniqueValueColumn])) {
						errorOnOthers.set(row[uniqueValueColumn], row);
					}
				}
			}
		}

		return {
			data: localData,
			validData,
			errorOnNull: [...errorOnNull.values()],
			errorOnUnique: [...errorOnUnique.values()],
			errorOnOthers: [...errorOnOthers.values()],
		};
	}, [localData, reviewedColumns, uniqueValueColumn]);

	const getColumns = useCallback(() => reviewedColumns, [reviewedColumns]);

	useImperativeHandle(ref, () => {
		return {
			getColumns,
			getData,
		};
	}, [getColumns, getData]);

	return {
		deleteColumn,
		deleteRow,
		displayedData,
		page,
		reviewedColumns,
		setPage,
		setSortBy,
		sortBy,
		updateColumn,
		updateData,
		slicedData,
		sortedData,
	};
}