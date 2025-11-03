import Chevron from '../assets/Chevron';
import './styles.scss';
import { useRef } from 'react';
import Skip from '../assets/Skip';

export type PaginationProps = {
	value: number;
	max: number;
	onChange?: (page: number) => void;

	/**
	 * Show a light box shadow
	 * @default false
	 */
	elevation?: boolean;
};

export function Pagination({ value, max, onChange = () => {}, elevation = false }: PaginationProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const changePageByOffset = (offset: number) => {
		const page = Math.min(Math.max(0, value + offset), max);

		if (inputRef.current) {
			inputRef.current.value = `${page}`;
		}

		onChange(page);
	};

	return (
		<div
			className='pagination'
			style={{
				boxShadow: elevation ? 'var(--light-shadow)' : '',
			}}
		>
			<button
				type='button'
				className='pagination-button'
				onClick={() => void onChange(1)}
				disabled={value === 1}
				title='Aller à la première page'
				aria-label='Aller à la première page'
			>
				<Skip
					style={{
						rotate: '180deg',
					}}
				/>
			</button>

			<button
				type='button'
				className='pagination-button'
				onClick={() => void changePageByOffset(-1)}
				disabled={value === 1}
				title='Aller à la page précédente'
				aria-label='Aller à la page précédente'
			>
				<Chevron
					style={{
						rotate: '90deg',
					}}
				/>
			</button>

			<div className='custom-page-input'>
				<input
					ref={inputRef}
					type='number'
					min={1}
					max={max}
					value={value}
				/>
				<p>/ {max}</p>
			</div>

			<button
				type='button'
				className='pagination-button'
				onClick={() => void changePageByOffset(1)}
				disabled={value === max}
				title='Aller à la page suivante'
				aria-label='Aller à la page suivante'
			>
				<Chevron
					style={{
						rotate: '-90deg',
					}}
				/>
			</button>

			<button
				type='button'
				className='pagination-button'
				onClick={() => void onChange(max)}
				disabled={value === max}
				title='Aller à la dernière page'
				aria-label='Aller à la dernière page'
			>
				<Skip />
			</button>
		</div>
	);
}