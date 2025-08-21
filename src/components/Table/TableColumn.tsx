import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react';
import { Arrow } from '../assets/Arrow';
import { Sort } from '../assets/Sort';
import Trash from '../assets/Trash';
import { SortByType } from './hooks/useTable';
import { ExtendedColumn } from './types';

type TableColumnProps = {
	column: ExtendedColumn;
	sortingHeaders: boolean;
	sortBy: SortByType | null;
	setSortBy: Dispatch<SetStateAction<SortByType | null>>;
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
	const onChange = useCallback(
		(ev: ChangeEvent<HTMLSelectElement>) => {
			updateColumn(column.label, ev.target.value);
		},
		[column, updateColumn]
	);

	const onSortClick = useCallback(() => {
		setSortBy((prev) => {
			if (!prev || prev.prop !== column.prop) {
				return {
					prop: column.prop,
					order: 'asc',
				};
			}

			if (prev.order === 'asc') {
				return {
					...prev,
					order: 'desc',
				};
			}

			return null;
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
								opacity: sortBy?.prop === column.prop ? 1 : undefined,
							}}
							onClick={onSortClick}
						>
							{sortBy && sortBy.prop === column.prop ? (
								<Arrow style={{ rotate: sortBy.order === 'asc' ? '-90deg' : '90deg' }} />
							) : (
								<Sort />
							)}
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
							opacity: sortBy?.prop === column.prop ? 1 : undefined,
						}}
						onClick={onSortClick}
					>
						{sortBy && sortBy.prop === column.prop ? (
							<Arrow style={{ rotate: sortBy.order === 'asc' ? '-90deg' : '90deg' }} />
						) : (
							<Sort />
						)}
					</button>
				)}
			</div>
		</th>
	);
}
