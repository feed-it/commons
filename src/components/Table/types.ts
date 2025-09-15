import { HTMLInputTypeAttribute, JSX } from 'react';

export type Column = {
	label: string;
	prop: string;
	/**
	 * `auto`: auto-detect each value type : boolean, string or number.
	 *
	 * `auto-non-numeric`: same as `auto` but number will be treated as string.
	 *
	 * `select`: will show a dropdown selector instead of an input.
	 *
	 * `gauge`: cannot be editable ! will show a progressbar.
	 *
	 * all other available values are the ones from HTML input type property.
	 */
	type: 'auto' | 'auto-non-numeric' | 'select' | 'gauge' | HTMLInputTypeAttribute;

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
	getColumns: () => ExtendedColumn[];
	getData: () => {
		data: any[];
		validData: any[];
		errorOnNull: any[];
		errorOnUnique: any[];
		errorOnOthers: any[];
	};
};