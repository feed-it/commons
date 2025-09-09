import { CSSProperties, RefObject } from 'react';
import Trash from '../assets/Trash';
import useTable from './hooks/useTable';
import './styles.scss';
import TableCell from './TableCell';
import TableColumn from './TableColumn';
import { Action, Column, TableHandle } from './types';

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
}: TableProps) {
	const { sortedData, sortBy, setSortBy, updateData, deleteRow, updateColumn, deleteColumn, reviewedColumns } =
		useTable({
			allowMismatch,
			columns,
			data,
			uniqueValueColumn,
			ref,
		});

	return (
		<div className='table-container'>
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
				{sortedData.map((row, index) => (
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
								{index + 1}
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
				))}
				</tbody>
			</table>
		</div>
	);
}