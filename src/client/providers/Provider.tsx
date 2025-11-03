import '../styles/globals.scss';
import { ReactNode } from 'react';

export type ProviderProps = {
	children: ReactNode;
}

export function Provider({ children }: ProviderProps) {
	return children;
}