import { JSX, MouseEventHandler } from 'react';
import { Refresh } from '../assets/Refresh';
import { Button } from '../Button';
import { Searchbar } from '../Searchbar/Searchbar';
import { Table } from '../Table';
import { TableProps } from '../Table/Table';

export type EnhancedTableProps = TableProps & {
	headerButtons?: {
		label: string;
		onClick?: MouseEventHandler<HTMLButtonElement>;
		color?: string;
		icon?: (() => JSX.Element) | JSX.Element;
	}[];
	searchbar?: boolean;
	footer?: boolean;
	refresh?: () => void;
};

export function EnhancedTable({
								  headerButtons = [],
								  refresh,
								  ...tableProps
							  }: EnhancedTableProps) {
	return (
		<div className="enhanced-table-container">
			<div className="enhanced-table-header">
				<Searchbar />
				
				{refresh && (
					<Button
						type="button"
						title="Rafraîchir les données"
						aria-title="Rafraîchir les données"
						color="var(--dark-gray)"
						textColor="var(--dark-gray)"
						hoverColor="var(--blue)"
						textHoverColor="var(--white)"
						outline
						squared
						onClick={refresh}
					>
						<Refresh />
					</Button>
				)}
				
				{headerButtons.length > 0 && (
					<div className="header-buttons-container">
						{headerButtons.map((button) => (
							<Button
								key={crypto.randomUUID()}
								type="button"
								color={button.color}
								onClick={button.onClick}
							>
								{typeof button.icon === 'function' ? button.icon() : button.icon}
								{button.label}
							</Button>
						))}
					</div>
				)}
			</div>
			
			<Table {...tableProps} />
		</div>
	);
}