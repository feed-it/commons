import { MouseEventHandler, useCallback, useState } from 'react';
import './styles.scss';

export type ToggleButtonProps = {
	checked?: boolean;
	id?: string;
	onChange?: (value: boolean) => void;
	readonly?: boolean;
};

export function ToggleButton({ checked = false, id, onChange, readonly = false }: ToggleButtonProps) {
	const [localChecked, setLocalChecked] = useState(checked);

	const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(ev) => {
			ev.stopPropagation();

			setLocalChecked((prev) => {
				onChange?.(!prev);
				return !prev;
			});
		},
		[onChange]
	);

	return (
		<button
			id={id}
			type='button'
			className='toggle-button'
			role='switch'
			aria-checked={localChecked}
			onClick={onClick}
			aria-readonly={readonly}
			disabled={readonly}
		>
			<span className='toggle-indicator' />
		</button>
	);
}