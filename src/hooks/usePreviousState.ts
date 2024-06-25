import { useEffect, useRef } from 'react';

/**
 * 전달된 state가 최신화 되기 바로 이전의 값을 반환하는 hook
 * @param state 변화를 감지할 기준 state
 */
const usePreviousState = <T>(state: T) => {
	const previous = useRef<T>();

	useEffect(() => {
		previous.current = state;
	}, [state]);

	return previous.current;
};

export default usePreviousState;
