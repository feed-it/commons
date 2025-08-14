import { CSSProperties } from 'react';
import Button from '../Button';
import useDropdown from './hooks/useDropdown';
import './styles.scss';

export interface DropdownProps {
	name: string;
	title?: string;
	icon?: import('react').JSX.Element;
	values: { label: string; value: any }[];
	defaultValue?: any;
	placement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
	onChange?: (value: any) => void;
	hideSelectedValue?: boolean;
	legacyDropdown?: boolean;
}

export default function Dropdown({
	name,
	title,
	icon,
	values = [],
	defaultValue,
	placement = 'bottom-left',
	onChange,
	hideSelectedValue = false,
	legacyDropdown = false,
}: DropdownProps) {
	const { containerRef, isOpened, setIsOpened, selectedValue, setSelectedValue } = useDropdown({
		values,
		defaultValue,
	});

	if (legacyDropdown) {
		return (
			<select
				name={name}
				className='button outline'
				autoComplete='off'
				value={selectedValue ? selectedValue.value : ''}
				style={
					{
						'--color': 'var(--blue)',
						'--text-color': 'var(--white)',
						'--hover-color': 'var(--blue)',
						'--text-hover-color': 'var(--white)',
						width: 'max-content',
					} as CSSProperties
				}
				onChange={(ev) => {
					const selectedOption = values.find((option) => option.value === ev.target.value);

					if (selectedOption) {
						setSelectedValue(selectedOption);
						onChange?.(selectedOption.value);
					}
				}}
			>
				<option
					value=''
					disabled
				>
					{title}
				</option>
				{values.map((option) => (
					<option
						key={crypto.randomUUID()}
						value={option.value}
					>
						{option.label}
					</option>
				))}
			</select>
		);
	}

	return (
		<div
			ref={containerRef}
			className='dropdown-container'
		>
			<Button
				type='button'
				color='var(--dark-gray)'
				hoverColor='var(--blue)'
				outline
				aria-expanded={isOpened}
				aria-controls='dropdown'
				onClick={() => setIsOpened((prev) => !prev)}
			>
				{icon}
				{hideSelectedValue || !selectedValue ? title : selectedValue.label}
			</Button>

			<div
				id='dropdown'
				className={`dropdown-popover`}
				aria-expanded={isOpened}
				style={{
					[placement.split('-')[0] === 'bottom' ? 'top' : 'bottom']: 'calc(100% + 5px)',
					[placement.split('-')[1]]: 0,
				}}
			>
				<div className='values-list'>
					{values.map((option) => (
						<label
							key={crypto.randomUUID()}
							className='value-row'
						>
							<input
								type='radio'
								name={name}
								value={option.value}
								autoComplete='off'
								checked={option.value === selectedValue?.value}
								onChange={() => {
									setSelectedValue(option);
									typeof onChange === 'function' && onChange(option.value);
								}}
							/>

							<span>{option.label}</span>
						</label>
					))}
				</div>
			</div>
		</div>
	);
}
