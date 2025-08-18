import { useEffect, useMemo } from 'react';
import { Dropdown } from '../Dropdown';
import { ExtendedColumn } from './types';

type TableCellProps = {
	row: any;
	column: ExtendedColumn;
	data: any[];
	allowMismatch: boolean;
	onChange: (value: string) => void;
};

export default function TableCell({ row, column, data, allowMismatch = false, onChange }: TableCellProps) {
	const value = useMemo(() => {
		//* Below exactMatch prevent potentialValue to return a value before the exact match could be found
		//* Because find method loop one by one array data
		//* Example:
		//* Available values are ['abc', 'ab'] and initialValue is 'ab';
		//* If allowMismatch is true, 'abc' will be returned instead of 'ab' because it's in the second position

		const prop = column.error?.type === 'mismatch' && column.error.target ? column.error.target : column.prop;
		const initialValue = row[prop];

		if (column.type !== 'select') {
			return initialValue;
		}

		const values = typeof column.values === 'function' ? column.values(row) : column.values;
		if (!values) return null;

		//* First find is there is an exact match
		const exactMatch = values.find((v) => {
			//* Case when v (available value) is from type: {label: string; value: any}
			if (typeof v === 'object') {
				return v.value === initialValue;
			}

			return v === initialValue;
		});

		if (exactMatch) {
			if (typeof exactMatch === 'object') return exactMatch.value;
			return exactMatch ?? null;
		}

		const potentialValue = values.find((v) => {
			//* Case when v (available value) is from type: {label: string; value: any}
			if (typeof v === 'object') {
				if (allowMismatch) {
					return `${v.value}`.toLowerCase().includes(`${initialValue}`.toLowerCase());
				}

				return v.value === initialValue;
			}

			if (allowMismatch) {
				return `${v}`.toLowerCase().includes(`${initialValue}`.toLowerCase());
			}
			return v === initialValue;
		});

		if (typeof potentialValue === 'object') return potentialValue.value;
		return potentialValue ?? null;
	}, [allowMismatch, column, row]);

	useEffect(() => {
		const prop = column.error?.type === 'mismatch' && column.error.target ? column.error.target : column.prop;
		const initialValue = row[prop];

		if (initialValue !== value) {
			onChange(value);
		}
	}, [column, onChange, row, value]);

	const warning = useMemo(() => {
		//* Nullable
		if (!(column.canBeNull ?? true) && (!value || `${value}`.length === 0)) {
			return 'Valeur requise';
		}

		//* Unique
		if (column.unique ?? false) {
			const prop = column.error?.type === 'mismatch' && column.error.target ? column.error.target : column.prop;
			const values = data.map((x) => x[prop]);

			let sameValues = 0;

			if (typeof column.unique === 'boolean' || column.unique === 'case') {
				sameValues = values.filter((x) => x === value).length;
			} else if (column.unique === 'base') {
				sameValues = values.filter((x) => `${x}`.toLowerCase() === `${value}`.toLowerCase()).length;
			}

			if (sameValues > 1) {
				return `Cette valeur doit être unique (trouvée ${sameValues} fois)`;
			}
		}

		//* Custom validation
		if (typeof column.validate === 'function' && !column.validate(value)) {
			return 'Cette valeur ne respecte pas les conditions de validation';
		}

		return undefined;
	}, [column, data, value]);

	if (column.type === 'gauge') {
		return <td></td>;
	}

	if (column.canEdit ?? true) {
		if (column.type === 'select') {
			let values;
			if (typeof column.values === 'function') {
				values = column.values(row);
			} else {
				values = column.values;
			}

			return (
				<td
					className={warning && 'warn'}
					title={warning}
				>
					<Dropdown
						name={column.prop}
						title='-'
						defaultValue={value}
						onChange={onChange}
						values={values ?? []}
						legacyDropdown
					/>
				</td>
			);
		}

		return (
			<td
				className={warning && 'warn'}
				title={warning}
			>
				<input
					name={column.prop}
					aria-label={column.label}
					type={column.type}
					className='cell-input'
					defaultValue={value}
					autoComplete='off'
					required
					onChange={(ev) => void onChange(ev.target.value)}
				/>
			</td>
		);
	}

	//* Specific to users
	//* TODO: Do we really need to have this ?
	if (column.prop.includes('group')) {
		return (
			<td
				className={warning && 'warn'}
				title={warning}
			>
				{value.split('/').at(-1)}
			</td>
		);
	}

	return (
		<td
			className={warning && 'warn'}
			title={warning}
		>
			{value}
		</td>
	);
}
