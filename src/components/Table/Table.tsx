import { CSSProperties, RefObject } from 'react';
import Trash from '../assets/Trash';
import useTable from './hooks/useTable';
import './styles.scss';
import TableCell from './TableCell';
import TableColumn from './TableColumn';
import { Action, Column, ExtendedColumn, TableHandle } from './types';
import { Pagination } from '../Pagination';

export type TableProps = {
	ref?: RefObject<TableHandle>;
	columns: Column[];
	data: any[];
	actions?: Action[];
	uniqueValueColumn: string;
	displayCount?: boolean;
	allowMismatch?: boolean;
	canDeleteRows?: boolean;
	sortingHeaders?: boolean;
	rowOptions?: {
		disableProp?: string;
		onClick?: (row: any) => void;
	};
	pagination?: boolean | number;
};

export function Table({
	ref,
	columns,
	data,
	actions = [],
	uniqueValueColumn,
	displayCount = true,
	allowMismatch = false,
	canDeleteRows = false,
	sortingHeaders = true,
	rowOptions,
	pagination = false,
}: TableProps) {
	const {
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
	} = useTable({
		allowMismatch,
		columns,
		data,
		pagination,
		uniqueValueColumn,
		ref,
	});

	return (
		<div className='table-container'>
			<div className='scrollable-table'>
				<table>
					<thead>
						<tr>
							{displayCount && (
								<th
									style={{
										padding: '5px',
										textAlign: 'center',
									}}
								>
									#
								</th>
							)}
							{reviewedColumns.map((column) => (
								<TableColumn
									key={`headingColumn#${column.prop}-${column.type}`}
									column={column}
									sortingHeaders={sortingHeaders}
									sortBy={sortBy}
									setSortBy={setSortBy}
									updateColumn={updateColumn}
									deleteColumn={deleteColumn}
								/>
							))}
							{(actions.length > 0 || canDeleteRows) && <th />}
						</tr>
					</thead>
					<tbody>
						{displayedData.map((row, index) =>
							renderRow(
								actions,
								canDeleteRows,
								deleteRow,
								displayCount,
								index,
								pagination,
								page,
								reviewedColumns,
								row,
								sortedData,
								uniqueValueColumn,
								updateData,
								rowOptions
							)
						)}
					</tbody>
				</table>
			</div>

			{pagination && (
				<Pagination
					max={slicedData.length}
					value={page}
					onChange={setPage}
				/>
			)}
		</div>
	);
}

function renderRow(
	actions: Action[],
	canDeleteRows: boolean,
	deleteRow: (id: any) => void,
	displayCount: boolean,
	index: number,
	pagination: boolean | number,
	page: number,
	reviewedColumns: ExtendedColumn[],
	row: any,
	sortedData: any[],
	uniqueValueColumn: string,
	updateData: (id: any, prop: string, value: any) => void,
	rowOptions?: {
		disableProp?: string;
		onClick?: (row: any) => void;
	}
) {
	const count = (() => {
		if (!pagination) return index + 1;

		if (typeof pagination === 'number') {
			return index + 1 + pagination * (page - 1);
		}

		return index + 1 + 100 * (page - 1);
	})();

	return (
		<tr
			key={row[uniqueValueColumn]}
			style={
				rowOptions?.disableProp && row[rowOptions.disableProp]
					? {
							opacity: 0.3,
						}
					: undefined
			}
			onClick={() => {
				if (rowOptions?.onClick) rowOptions.onClick(row);
			}}
		>
			{displayCount && (
				<td
					style={{
						padding: '5px',
						textAlign: 'center',
					}}
				>
					{count}
				</td>
			)}

			{reviewedColumns.map((column) => (
				<TableCell
					key={`${row[uniqueValueColumn]}#${column.prop}-${column.type}`}
					row={row}
					column={column}
					data={sortedData}
					allowMismatch
					onChange={(value) =>
						void updateData(
							row[uniqueValueColumn],
							column.error?.type === 'mismatch' && column.error.target
								? column.error.target
								: column.prop,
							value
						)
					}
				/>
			))}

			{(actions.length > 0 || canDeleteRows) && (
				<td>
					{actions.map((action) => (
						<button
							key={action.label}
							type='button'
							className='action-button'
							title={action.label}
							aria-label={action.label}
							onClick={(ev) => {
								ev.preventDefault();
								ev.stopPropagation();
								action.onClick?.(row);
							}}
							style={
								{
									'--color': action.color ?? 'var(--blue)',
								} as CSSProperties
							}
						>
							{typeof action.icon === 'function' ? action.icon() : action.icon}
						</button>
					))}
					{canDeleteRows && (
						<button
							type='button'
							className='action-button'
							title='Supprimer la ligne'
							aria-label='Supprimer la ligne'
							onClick={() => void deleteRow(row[uniqueValueColumn])}
							style={
								{
									'--color': 'var(--red)',
								} as CSSProperties
							}
						>
							<Trash />
						</button>
					)}
				</td>
			)}
		</tr>
	);
}