import { SliderProps } from '../Slider';

type useActionsProps = Pick<SliderProps, 'onChange'> & { minMaxValues: { min: number; max: number } };

export const useActions = ({ minMaxValues, onChange }: useActionsProps) => {
	const handleChange = (values: number | number[]) => {
		if (typeof values === 'number') {
			onChange([values]);
			return;
		}
		if (values[0] === minMaxValues.min && values[1] === minMaxValues.max) {
			onChange([]);
			return;
		}

		onChange(values);
	};

	return {
		handleChange,
	};
};
