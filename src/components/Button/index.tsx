import { CSSProperties } from 'react';
import './styles.scss';

interface ButtonProps {
	color?: string;
	textColor?: string;
	hoverColor?: string;
	textHoverColor?: string;
	squared?: boolean;
	outline?: boolean;
	rounded?: boolean;
}

export default function Button({
	color = 'var(--blue)',
	textColor = 'var(--white)',
	hoverColor = color,
	textHoverColor = textColor,
	squared = false,
	outline = false,
	rounded = false,
	children,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps) {
	return (
		<button
			{...props}
			className={`button ${squared ? 'squared' : ''} ${outline ? 'outline' : ''} ${props.className ?? ''}`}
			style={
				{
					'--color': color,
					'--text-color': textColor,
					'--hover-color': hoverColor,
					'--text-hover-color': textHoverColor,
					borderRadius: rounded ? '50%' : '',
					...props.style,
				} as CSSProperties
			}
		>
			{children}
		</button>
	);
}
