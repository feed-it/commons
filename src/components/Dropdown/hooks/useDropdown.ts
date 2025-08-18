import { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from '../../../hooks/useOutsideClick';

type useDropdownType = {
	values: { label: string; value: any }[];
	defaultValue?: any;
};

export default function useDropdown({ values, defaultValue }: useDropdownType) {
	const containerRef = useRef(null);

	const [isOpened, setIsOpened] = useState(false);
	const [selectedValue, setSelectedValue] = useState(values.find((x) => x.value === defaultValue));

	useEffect(() => {
		setSelectedValue(values.find((x) => x.value === defaultValue));
	}, [values, defaultValue]);

	useOutsideClick(containerRef, () => setIsOpened(false));

	return {
		containerRef,

		isOpened,
		setIsOpened,

		selectedValue,
		setSelectedValue,
	};
}
