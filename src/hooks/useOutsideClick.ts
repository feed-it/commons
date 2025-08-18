import { RefObject, useEffect } from 'react';

export function useOutsideClick(ref: RefObject<HTMLElement | null>, action: () => void) {
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node | null)) {
				action();
			}
		}
		// Bind the event listener
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [ref, action]);
}
