import { SVGProps } from 'react';

export default function Skip(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className='ionicon'
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
			<path d='M184 112l144 144-144 144 M328 112l0 288' />
		</svg>
	);
}