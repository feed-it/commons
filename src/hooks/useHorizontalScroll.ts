import { useEffect, useRef } from 'react';

const useHorizontalScroll = (onScroll?: (ev: WheelEvent) => void) => {
	const elRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const el = elRef.current;

		if (!el) {
			return;
		}

		const onWheel = (ev: WheelEvent) => {
			if (ev.deltaY === 0) return;

			el.scrollTo({
				left: el.scrollLeft + ev.deltaY * 0.2,
			});

			onScroll?.(ev);
		};
		el.addEventListener('wheel', onWheel, { passive: true });
		return () => el.removeEventListener('wheel', onWheel);
	}, [onScroll]);

	return elRef;
};

export default useHorizontalScroll;
