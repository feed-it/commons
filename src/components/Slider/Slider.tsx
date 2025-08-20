import RCSlider from 'rc-slider';
import { HTMLAttributes, ReactElement } from 'react';
import { useActions } from './hooks/useActions';
import { useData } from './hooks/useData';
import './styles.scss';

export type SliderProps = {
	values: number[];
	selectedValues: number[];
	onChange: (values: number[]) => void;
};

export function Slider({ values = [], selectedValues = [], onChange }: SliderProps) {
	const { defaultValues, minMaxValues } = useData({ values, selectedValues });

	const { handleChange } = useActions({ minMaxValues, onChange });

	const renderThumb = (node: ReactElement<HTMLAttributes<HTMLDivElement>>, { value }: { value: number }) => {
		return (
			<div
				key={node.key}
				{...node.props}
			>
				<span className='rc-slider-handle-tooltip'>{value}</span>
			</div>
		);
	};

	return (
		<RCSlider
			className='filter-slider'
			range
			min={minMaxValues.min}
			max={minMaxValues.max}
			step={1}
			value={defaultValues}
			pushable
			keyboard
			handleRender={renderThumb}
			onChange={handleChange}
		/>
	);
}
