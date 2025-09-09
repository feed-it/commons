import { useCallback, useState } from 'react';

export function usePromise(action: () => Promise<void>, deps: any[]) {
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
	}, [action, ...deps]);

	return [callback, isLoading, isSuccess, isError];
}
