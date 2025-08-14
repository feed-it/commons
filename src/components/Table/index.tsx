import { CSSProperties, RefObject } from 'react';
import TableCell from './TableCell';
import TableColumn from './TableColumn';
import Trash from './assets/Trash';
import useTable from './hooks/useTable';
import './styles.scss';
import { Action, Column, TableHandle } from './types';

interface TableProps {
	ref?: RefObject<TableHandle>;
	columns: Column[];
	data: any[];
	actions?: Action[];
	uniqueValueColumn: string;
	displayCount?: boolean;
	allowMismatch?: boolean;
	canDeleteRows?: false;
}

export default function Table({
	ref,
	columns,
	data,
	actions = [],
	uniqueValueColumn,
	displayCount = true,
	allowMismatch = false,
	canDeleteRows = false,
}: TableProps) {
	const { localData, updateData, deleteRow, updateColumn, deleteColumn, reviewedColumns } = useTable({
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
						{displayCount && <th>#</th>}
						{reviewedColumns.map((column) => (
							<TableColumn
								key={`headingColumn#${column.prop}`}
								column={column}
								updateColumn={updateColumn}
								deleteColumn={deleteColumn}
							/>
						))}
						{(actions.length > 0 || canDeleteRows) && <th />}
					</tr>
				</thead>
				<tbody>
					{localData.map((row, index) => (
						<tr key={row[uniqueValueColumn]}>
							{displayCount && <td>{index + 1}</td>}

							{reviewedColumns.map((column) => (
								<TableCell
									key={`${row[uniqueValueColumn]}#${column.prop}`}
									row={row}
									column={column}
									data={localData}
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
											onClick={() => void action.onClick?.(row)}
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
