import { CSSProperties } from 'react';
import './styles.scss';

export type ProgressBarProps = {
	id: string;
	label?: string;
	max?: number;
	min?: number;
	value: number;
	color?: string;
	displayText?: boolean;
};

export function ProgressBar({
	id = '',
	label = '',
	max = 100,
	value = 50,
	color = 'var(--green)',
	displayText = true,
}: ProgressBarProps) {
	const maxText = max === 100 ? '%' : `/${max}`;
	const fillWidth = (value * 100) / max;
	const height = label ? '1.5em' : '1em';

	return (
		<div className='progress-bar-container'>
			{label && (
				<label
					htmlFor={id}
					className='progress-bar-label'
				>
					{label}
				</label>
			)}

			<div
				id={id}
				role='progressbar'
				className='progress-bar'
				aria-valuemin={0}
				aria-valuenow={value}
				aria-valuemax={max}
				aria-live='polite'
				aria-atomic
				style={
					{
						'--color': color,
						height,
					} as CSSProperties
				}
			>
				<div
					className='progress-bar-fill'
					style={{
						width: `${fillWidth}%`,
					}}
				/>

				{displayText && (
					<>
						<span
							className='progress-bar-text'
							aria-hidden
							style={{
								clipPath: `inset(0 ${100 - fillWidth}% 0 0)`,
							}}
						>
							{value}
							{maxText}
						</span>
						<span
							className='progress-bar-text'
							style={{
								clipPath: `inset(0 0 0 ${fillWidth}%)`,
							}}
						>
							{value}
							{maxText}
						</span>
					</>
				)}
			</div>
		</div>
	);
}
