import { SVGProps } from 'react';

export const Arrow = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 512 512'
			focusable={false}
			aria-hidden
			{...props}
		>
			<path
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='32'
				d='M244 400L100 256l144-144M120 256h292'
			/>
		</svg>
	);
};
