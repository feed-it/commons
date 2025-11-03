import './styles.scss';

export type TablePlaceholderProps = {
	columns: number;
	rows: number;
	blur?: boolean | number;
}

export function TablePlaceholder({
									 columns, rows, blur,
								 }: TablePlaceholderProps) {
	return (
		<div className="table-placeholder" style={{
			filter: blur ? `blur(${typeof blur === 'number' ? `${blur}px` : '4px'})` : 'none',
		}}>
			<div className="table-heading" style={{
				gridTemplateColumns: `repeat(${columns}, 150px)`,
			}}>
				{Array.from(Array(columns).keys()).map(() => (
					<div
						key={crypto.randomUUID()}
						className="column-heading"
					/>
				))}
			</div>
			
			<div className="table-content">
				{Array.from(Array(rows).keys()).map(() => (
					<div
						key={crypto.randomUUID()}
						className="table-row"
						style={{
							gridTemplateColumns: `repeat(${columns}, 150px)`,
						}}
					>
						{Array.from(Array(columns).keys()).map(() => (
							<div
								key={crypto.randomUUID()}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}