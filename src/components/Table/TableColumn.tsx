import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react';
import { Sort } from '../assets/Sort';
import Trash from '../assets/Trash';
import { ExtendedColumn } from './types';

type TableColumnProps = {
	column: ExtendedColumn;
	sortingHeaders: boolean;
	sortBy?: string;
	setSortBy: Dispatch<SetStateAction<string | undefined>>;
	updateColumn: (oldColumn: string, newColumn: string) => void;
	deleteColumn: (prop: string) => void;
};

export default function TableColumn({
	column,
	sortingHeaders,
	sortBy,
	setSortBy,
	updateColumn,
	deleteColumn,
}: TableColumnProps) {
	console.log('sortBy: ', sortBy);
	const onChange = useCallback(
		(ev: ChangeEvent<HTMLSelectElement>) => {
			updateColumn(column.label, ev.target.value);
		},
		[column, updateColumn]
	);

	const onSortClick = useCallback(() => {
		setSortBy((prev) => {
			if (prev === column.prop) {
				return undefined;
			}

			return column.prop;
		});
	}, []);

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

					{sortingHeaders && (
						<button
							type='button'
							className='column-button'
							title='Trier la donnée'
							aria-label='Trier la donnée'
							style={{
								opacity: sortBy === column.prop ? 1 : undefined,
							}}
							onClick={onSortClick}
						>
							<Sort />
						</button>
					)}

					<button
						type='button'
						className='column-button'
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

	return (
		<th>
			<div className='cell-container'>
				<span>{column.label}</span>

				{sortingHeaders && (
					<button
						type='button'
						className='column-button'
						title='Trier la donnée'
						aria-label='Trier la donnée'
						style={{
							opacity: sortBy === column.prop ? 1 : undefined,
						}}
						onClick={onSortClick}
					>
						<Sort />
					</button>
				)}
			</div>
		</th>
	);
}
