import { DependencyList, useCallback, useState } from 'react';

export function usePromise<T extends () => Promise<void>>(
	action: T,
	deps: DependencyList
): [() => Promise<void>, boolean, boolean, boolean] {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [isError, setIsError] = useState(false);

	const callback = useCallback(async () => {
		setIsLoading(true);
		setIsSuccess(false);
		setIsError(false);

		try {
			await action();
		} catch {
			setIsError(true);
		}

		setIsSuccess(true);
		setIsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [action, ...deps]);

	return [callback, isLoading, isSuccess, isError];
}
