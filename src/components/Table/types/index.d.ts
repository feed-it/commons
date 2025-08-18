import { HTMLInputTypeAttribute, JSX } from 'react';

export type Column = {
	label: string;
	prop: string;
	type: 'select' | 'gauge' | HTMLInputTypeAttribute;

	values?: { label: string; value: string }[] | ((row: any) => { label: string; value: string }[]);
	canBeNull?: boolean;
	canEdit?: boolean;
	unique?: boolean | 'base' | 'case';
	validate?: (value: string) => boolean;

	min?: number;
	max?: number;
	color?: string;
	displayText?: boolean;
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
};
