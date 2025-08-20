import { SVGProps } from 'react';

export const Refresh = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 512 512'
			fill='none'
			stroke='currentColor'
			strokeWidth='32'
			focusable={false}
			aria-hidden
			{...props}
		>
			<path
				d='M320 146s24.36-12-64-12a160 160 0 10160 160'
				strokeLinecap='round'
				strokeMiterlimit='10'
			/>
			<path
				d='M256 58l80 80-80 80'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};
