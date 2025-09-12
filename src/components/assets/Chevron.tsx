import { SVGProps } from 'react';

export default function Chevron(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 512 512'
			fill='none'
			stroke='currentColor'
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='32'
			focusable={false}
			aria-hidden
			{...props}
		>
			<path d='M112 184l144 144 144-144' />
		</svg>
	);
}