import { useRef, useEffect, DependencyList } from 'react';

/**
 * 첫 렌더링을 제외하고 useEffect를 동작시키는 hook
 * @param callback Effect 내부 실행함수
 * @param dependencies Effect 수행지점에 대한 state
 */
const useAfterDidMountEffect = (callback: () => void, dependencies?: DependencyList) => {
	const mount = useRef(false);

	useEffect(() => {
		if (mount.current) callback();
		else mount.current = true;
	}, dependencies ?? []);
};

export default useAfterDidMountEffect;
