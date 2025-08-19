import { HTMLInputTypeAttribute, JSX } from 'react';

export type Column = {
	label: string;
	prop: string;
	type: 'select' | 'gauge' | HTMLInputTypeAttribute;

	values?: { label: string; value: string }[] | ((row: any) => { label: string; value: string }[]);
	allowNull?: boolean;
	editable?: boolean;
	unique?: boolean | 'base' | 'case';
	validate?: (value: string) => boolean | string;

	min?: number;
	max?: number;
	color?: string;
	displayText?: boolean;

	actions?: Action[];
};

export type ExtendedColumn = Column & {
	error?: {
		type: string;
		target?: string;
		columns: Column[];
	};
};

export type Action = {
	label: string;
	icon: JSX.Element | (() => JSX.Element);
	color?: string;
	onClick: (row: any) => void;
};

export type TableHandle = {
	columns: ExtendedColumn[];
	data: any[];
	validData: any[];
	errorOnNull: any[];
	errorOnUnique: any[];
	errorOnOthers: any[];
};
