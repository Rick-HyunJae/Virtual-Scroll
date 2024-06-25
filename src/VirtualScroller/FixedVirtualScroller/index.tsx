import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { isEmpty, cloneDeep, debounce } from 'lodash-es';

import usePreviousState from '../../hooks/usePreviousState';

type TElementProp = {
    componentType?: keyof JSX.IntrinsicElements;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.PropsWithChildren<any>;
};

type TVirtualScrollerProp = TElementProp & {
    scrollContainerRef: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement>;
    viewportContainerRef?: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement>;
    rowHeight: number;
    rowGap?: number;
    buffer?: number;
    data: Array<any>;
    firstVisibleRowIndex?: number;
    createRowElement: (item: any, index: number) => HTMLElement | JSX.Element | React.ReactElement | React.ReactNode;
    afterRenderCallback?: (param: { first: number; last: number }) => void;
};

const CONTAINER_CLASSNAME = 'VirtualScroller';

/* -------------------------------------------------------------------------- */
/* TODO
    - class 형태로 변경
    - 컴포넌트를 return하는 메소드를 분리 (외부에서는 현재 체계를 사용할 수 있도록)
    - class에 대한 constructor 및 get, set 형태는 외부에서 관리하도록
    - data 변경, moveToIndex, 반응형 등과 같은 내용은 외부에서 주입하도록 설정
*/
/* -------------------------------------------------------------------------- */

export default function VirtualScrollContainer(props: TVirtualScrollerProp) {
    const { componentType = 'div', id, className, style, children, ...constructor } = props;
    const {
        scrollContainerRef,
        viewportContainerRef,
        rowHeight,
        rowGap = 0,
        buffer = 10,
        data,
        firstVisibleRowIndex,
        createRowElement,
        afterRenderCallback,
    } = constructor;

    const [renderItemIdx, setRenderItemIdx] = useState<{ first: number; last: number }>({ first: 0, last: 0 });
    const prevRenderItemIdx = usePreviousState(renderItemIdx);

    const containerRef = useRef<HTMLElement | null>(null);
    const currentDataList = useRef<Array<any>>(data);

    const breakScrollEvent = useRef<boolean>(false);
    const topHiddenItemCount = useRef<number>(0);
    const bottomHiddenItemCount = useRef<number>(0);

    const _className: string = useMemo(() => (isEmpty(className) ? CONTAINER_CLASSNAME : `${CONTAINER_CLASSNAME} ${className}`), []);

    useEffect(() => {
        if (!scrollContainerRef.current) {
            throw new Error('Invalid ScrollContainer Element');
        }

        if (rowHeight <= 0) {
            throw new Error('RowHeight must be greater than zero');
        }

        if (firstVisibleRowIndex !== undefined && firstVisibleRowIndex <= 0) {
            throw new Error('firstVisibleRowIndex must be greater than zero');
        }

        scrollContainerRef.current?.addEventListener('scroll', debounce(onScrollListener, 0));

        return () => {
            scrollContainerRef.current?.removeEventListener('scroll', debounce(onScrollListener, 0));
        };
    }, []);

    useEffect(() => {
        calcRenderItemList(firstVisibleRowIndex);
    }, [firstVisibleRowIndex]);

    useEffect(() => {
        currentDataList.current = cloneDeep(data);
        calcRenderItemList();
    }, [data]);

    const onScrollListener = () => calcRenderItemList();

    const setPositionInViewportContainer = (scrollTop?: number) => {
        if (!containerRef.current) return;

        const paddingTop = topHiddenItemCount.current * (rowHeight + rowGap) + 'px';
        const paddingBottom = bottomHiddenItemCount.current * (rowHeight + rowGap) + 'px';

        if (viewportContainerRef?.current) {
            viewportContainerRef.current.style.paddingTop = paddingTop;
            viewportContainerRef.current.style.paddingBottom = paddingBottom;
        } else {
            containerRef.current.style.paddingTop = paddingTop;
            containerRef.current.style.paddingBottom = paddingBottom;
        }

        scrollTop !== undefined && (scrollContainerRef.current!.scrollTop = scrollTop);
    };

    const calcRenderItemList = (moveToTargetIdx?: number) => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, clientHeight } = scrollContainerRef.current;
        const currentDataLength = currentDataList.current.length === 0 ? 0 : currentDataList.current.length - 1; // 현재 데이터 개수를 0부터 시작하는 값으로 변경

        // 상단에 렌더링될 item index
        let _firstVisibleRowIdx = 0;
        let _firstExistingRowIdx = 0;

        // 하단에 렌더링될 item index
        let _lastVisibleRowIdx = 0;
        let _lastExistingRowIdx = 0;

        if (moveToTargetIdx !== undefined) {
            // 마우스 스크롤 동작이 아닌 방식으로 위치를 이동하는 경우
            if (moveToTargetIdx >= currentDataList.current.length) throw new Error("Can't move scroll over the data length");

            const visibleRowLength = Math.floor(clientHeight / (rowHeight + rowGap));
            const calcFirstVisibleRowIdx = Math.max(0, moveToTargetIdx);

            _firstVisibleRowIdx = calcFirstVisibleRowIdx + visibleRowLength > currentDataLength ? currentDataLength - visibleRowLength : calcFirstVisibleRowIdx;
            _firstExistingRowIdx = Math.max(0, _firstVisibleRowIdx - buffer);
            _lastVisibleRowIdx = Math.floor(_firstVisibleRowIdx + visibleRowLength);
            _lastExistingRowIdx = _lastVisibleRowIdx + buffer;
        } else {
            // 마우스 스크롤 방식으로 위치를 이동하는 경우
            _firstVisibleRowIdx = Math.floor(scrollTop / (rowHeight + rowGap));
            _firstExistingRowIdx = Math.max(0, _firstVisibleRowIdx - buffer);
            _lastVisibleRowIdx = Math.floor((scrollTop + clientHeight) / (rowHeight + rowGap));
            _lastExistingRowIdx = _lastVisibleRowIdx + buffer;
        }

        const verifyFirstExistingRowIdx = _firstExistingRowIdx < 0 ? 0 : _firstExistingRowIdx;
        const verifyLastExistingRowIdx = _lastExistingRowIdx > currentDataLength ? currentDataLength : _lastExistingRowIdx;
        const moveScrollSize = moveToTargetIdx ? moveToTargetIdx * (rowHeight + rowGap) : undefined;

        topHiddenItemCount.current = verifyFirstExistingRowIdx;
        bottomHiddenItemCount.current = Math.max(0, currentDataList.current.length - verifyLastExistingRowIdx);

        setPositionInViewportContainer(moveScrollSize);
        setRenderItemIdx((_) => ({ first: verifyFirstExistingRowIdx, last: verifyLastExistingRowIdx }));

        if (afterRenderCallback) {
            if (prevRenderItemIdx?.first === renderItemIdx.first && prevRenderItemIdx?.last === renderItemIdx.last) return;

            afterRenderCallback({ first: verifyFirstExistingRowIdx, last: verifyLastExistingRowIdx });
        }
    };

    const RenderRowElements = useCallback(() => {
        if (renderItemIdx.first === renderItemIdx.last) return null;

        return (
            <>
                {data.map((item, index) => {
                    if (index < renderItemIdx.first || index > renderItemIdx.last) return null;

                    return createRowElement(item, index);
                })}
            </>
        );
    }, [data, renderItemIdx, createRowElement]);

    return React.createElement(
        componentType,
        { ref: containerRef, id, className: _className, style },
        <>
            <RenderRowElements />
            {children}
        </>
    );
}
