import { InputHTMLAttributes } from 'react';
import './styles.scss';

export type CheckboxProps = { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Checkbox(props: CheckboxProps) {
	return (
		<label htmlFor={props.id} className="checkbox" style={{
			cursor: props.disabled ? 'default' : 'pointer',
		}}>
			<input
				type="checkbox"
				{...props}
				style={{
					cursor: props.disabled ? 'default' : 'pointer',
					...props.style,
				}}
			/>
			
			{props.label}
		</label>
	);
}