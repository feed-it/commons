import { ChangeEvent, useCallback } from 'react';
import Trash from './assets/Trash';
import { ExtendedColumn } from './types';

interface TableColumnProps {
	column: ExtendedColumn;
	updateColumn: (oldColumn: string, newColumn: string) => void;
	deleteColumn: (prop: string) => void;
}

export default function TableColumn({ column, updateColumn, deleteColumn }: TableColumnProps) {
	const onChange = useCallback(
		(ev: ChangeEvent<HTMLSelectElement>) => {
			updateColumn(column.label, ev.target.value);
		},
		[column, updateColumn]
	);

	if (column.error) {
		return (
			<th className={`error ${column.error.type === 'mismatch' ? 'warn' : ''}`}>
				<div className='cell-container'>
					<div className='select-container'>
						{column.error.type === 'mismatch' ? (
							<p>
								{column.label} (<s>{column.error.target}</s> {column.prop})
							</p>
						) : (
							<p>{column.label}</p>
						)}

						<select
							name={column.prop}
							value={''}
							onChange={onChange}
						>
							<option
								value={''}
								disabled
							/>

							{column.error.columns.map((col) => (
								<option
									key={col.prop}
									value={col.prop}
								>
									{col.label} ({col.prop})
								</option>
							))}
						</select>
					</div>

					<button
						type='button'
						className='delete-button'
						title='Supprimer la colonne'
						aria-label='Supprimer la colonne'
						onClick={() => void deleteColumn(column.prop)}
					>
						<Trash />
					</button>
				</div>
			</th>
		);
	}

	return <th>{column.label}</th>;
}
