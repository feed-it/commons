import { useEffect, useMemo, useState } from 'react';
import { SliderProps } from '../Slider';

type useDataProps = Omit<SliderProps, 'onChange'>;

export const useData = ({ values, selectedValues }: useDataProps) => {
	const minMaxValues = useMemo(() => {
		if (values.length === 0) {
			return {
				min: 0,
				max: 100,
			};
		}

		const minValue = Math.floor(Math.min(...values));
		const maxValue = Math.ceil(Math.max(...values));

		return {
			min: minValue,
			max: maxValue,
		};
	}, [values]);

	const [defaultValues, setDefaultValues] = useState([minMaxValues.min, minMaxValues.max]);

	useEffect(() => {
		if (selectedValues.length !== 2) {
			setDefaultValues([minMaxValues.min, minMaxValues.max]);
			return;
		}

		setDefaultValues(selectedValues);
	}, [selectedValues, minMaxValues]);

	return { defaultValues, minMaxValues };
};
