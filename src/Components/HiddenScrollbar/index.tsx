import React, { forwardRef, PropsWithChildren, MutableRefObject } from 'react';
import PerfectScrollbar, { ScrollBarProps } from 'react-perfect-scrollbar';
import { has, omit } from 'lodash-es';

import './hiddenScrollbar.css';

interface IScrollBar extends ScrollBarProps {
    children: PropsWithChildren<any>;
}

const HiddenScrollbar = forwardRef((props: IScrollBar, ref) => {
    const { children } = props;

    const originScrollbarProps: ScrollBarProps = omit(props, 'ref');

    if (children.length > 1) throw Error('Invalid Children Length');
    if (ref && !has(ref, 'current')) throw Error('Invalid Ref Type');

    return (
        <PerfectScrollbar
            containerRef={(_ref: HTMLElement) => {
                if (!_ref) return;

                // @ts-ignore
                _ref._getBoundingClientRect = _ref.getBoundingClientRect;

                // @ts-ignore
                _ref.getBoundingClientRect = () => {
                    // @ts-ignore
                    const original = _ref._getBoundingClientRect();

                    return {
                        bottom: original.bottom,
                        left: original.left,
                        right: original.right,
                        top: original.top,
                        width: Math.round(original.width),
                        height: Math.round(original.height),
                        x: original.x,
                        y: original.y,
                    };
                };

                ref && ((ref as MutableRefObject<HTMLElement | undefined>).current = _ref);
            }}
            {...originScrollbarProps}
            options={{ wheelPropagation: false }}
        >
            {children}
        </PerfectScrollbar>
    );
});

export default HiddenScrollbar;
