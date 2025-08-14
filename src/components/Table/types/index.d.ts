import { HTMLInputTypeAttribute, JSX } from 'react';

export interface Column {
	label: string;
	prop: string;
	inputType?: HTMLInputTypeAttribute | 'select';
	values?: { label: string; value: string }[] | ((row: any) => { label: string; value: string }[]);
	canEdit?: boolean;
	canBeNull?: boolean;
	unique?: boolean | 'base' | 'case';
	validate?: (value: string) => boolean;
}

export interface ExtendedColumn extends Column {
	error?: {
		type: string;
		target?: string;
		columns: Column[];
	};
}

export interface Action {
	label: string;
	icon: JSX.Element | (() => JSX.Element);
	color?: string;
	onClick: (row: any) => void;
}

export interface TableHandle {
	columns: ExtendedColumn[];
	data: any[];
	validData: any[];
}
