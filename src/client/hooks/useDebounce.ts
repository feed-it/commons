import debounce from 'lodash.debounce';
import { useEffect, useMemo, useRef } from 'react';

export function useDebounce(callback: () => void, wait: number = 500) {
	const ref = useRef<(...args: any[]) => void>(null);

	useEffect(() => {
		ref.current = callback;
	}, [callback]);

	const debouncedCallback = useMemo(() => {
		const func = (...args: any[]) => {
			ref.current?.(...args);
		};

		return debounce(func, wait);
	}, [wait]);

	return debouncedCallback;
}
