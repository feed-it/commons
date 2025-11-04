import RCSlider from 'rc-slider';
import { CSSProperties, HTMLAttributes, ReactElement, useCallback, useEffect, useState } from 'react';
import './styles.scss';

export type SliderProps = {
	min: number;
	max: number;
	value: number | number[];
	step?: number;
	range?: boolean;
	vertical?: boolean;
	tooltip?: boolean | 'top' | 'right' | 'bottom' | 'left';
	onChange?: (values: number | number[]) => void;
};

export function Slider({
	min,
	max,
	value,
	step = 1,
	range = false,
	vertical = false,
	tooltip = true,
	onChange,
}: SliderProps) {
	const [localValue, setLocalValue] = useState(value);
	useEffect(() => setLocalValue(value), [value]);

	const localOnChange = useCallback(
		(val: number | number[]) => {
			setLocalValue(val);
			onChange?.(val);
		},
		[onChange]
	);

	const renderThumb = useCallback(
		(node: ReactElement<HTMLAttributes<HTMLDivElement>>, { value }: { value: number }) => {
			let position: CSSProperties = {
				top: '-5px',
				left: '50%',
				transform: 'translate(-50%, -100%)',
			};
			if (tooltip === 'left') {
				position = {
					top: '50%',
					left: '-5px',
					transform: 'translate(-100%, -50%)',
				};
			} else if (tooltip === 'right') {
				position = {
					top: '50%',
					right: '-5px',
					transform: 'translate(100%, -50%)',
				};
			} else if (tooltip === 'bottom') {
				position = {
					bottom: '-5px',
					left: '50%',
					transform: 'translate(-50%, 100%)',
				};
			}

			return (
				<div
					key={node.key}
					{...node.props}
				>
					{tooltip && (
						<span
							className='rc-slider-handle-tooltip'
							style={position}
						>
							{value}
						</span>
					)}
				</div>
			);
		},
		[tooltip]
	);

	return (
		<RCSlider
			min={min}
			max={max}
			step={step}
			value={localValue}
			range={range}
			vertical={vertical}
			pushable
			keyboard
			handleRender={renderThumb}
			onChange={localOnChange}
		/>
	);
}