import { debounce } from 'lodash-es';

/**
 * 호출한 Element 내 onScroll 이벤트 발생 시, 특정 스크롤 높이에 대한 콜백함수 실행하는 hook
 * @param callback target height에 도달했을 때 수행함수
 * @param targetHeight callback이 동작하는 scroll height 지점
 */
const useHandleOnScrollHeight = <T extends HTMLElement>(callback: () => void, targetHeight?: number): ((event: React.UIEvent<T>) => void) => {
    const _targetHeight = targetHeight ?? 90;

    const handleOnScrollHeight = debounce((event) => {
        const { target } = event.nativeEvent;
        const scrollTop = (target as T)?.scrollTop;
        const clientHeight = (target as T)?.clientHeight;
        const scrollHeight = (target as T)?.scrollHeight;

        if (!scrollTop || !clientHeight || !scrollHeight) return;

        // scrolling 수행점 계산
        if (scrollTop + clientHeight >= scrollHeight * (_targetHeight / 100)) callback();
    }, 150);

    return (event) => handleOnScrollHeight(event);
};

export default useHandleOnScrollHeight;

/**
 * 사용 예시
 * import useHandleOnScrollHeight from '~hooks/useHandleOnScrollHeight';
 *
 * const callback = () => console.log('################');
 * <div className="content" onScroll={useHandleOnScrollHeight(callback, 50)}>
 */
