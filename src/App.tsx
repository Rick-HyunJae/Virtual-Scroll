import React, { useState, useRef } from 'react';

import FixedVirtualScroller from './VirtualScroller/FixedVirtualScroller';
import TableRow from './TableRow';

import useHandleOnScrollHeight from './hooks/useHandleOnScrollHeight';

import HiddenScrollbar from './Components/HiddenScrollbar';

import './style.css';

const DEFAULT_CONTAINER_HEIGHT = 500;
const DEFAULT_ROW_HEIGHT = 60;
const DEFAULT_BUFFER_SIZE = 10;
const DEFAULT_PAGE_SIZE = 50;
const TEST_ROW_LIST = [
    'number 0',
    'number 1',
    'number 2',
    'number 3',
    'number 4',
    'number 5',
    'number 6',
    'number 7',
    'number 8',
    'number 9',
    'number 10',
    'number 11',
    'number 12',
    'number 13',
    'number 14',
    'number 15',
    'number 16',
    'number 17',
    'number 18',
    'number 19',
    'number 20',
    'number 21',
    'number 22',
    'number 23',
    'number 24',
    'number 25',
    'number 26',
    'number 27',
    'number 28',
    'number 29',
    'number 30',
    'number 31',
    'number 32',
    'number 33',
    'number 34',
    'number 35',
    'number 36',
    'number 37',
    'number 38',
    'number 39',
    'number 40',
    'number 41',
    'number 42',
    'number 43',
    'number 44',
    'number 45',
    'number 46',
    'number 47',
    'number 48',
    'number 49',
];

function App() {
    const [startIdx, setStartIdx] = useState<number | undefined>(undefined);
    const [data, setData] = useState<Array<any>>(TEST_ROW_LIST);

    const scrollElement = useRef<HTMLDivElement>(null);
    const viewportElement = useRef<HTMLDivElement>(null);

    const handleOnScroll = () => {
        const _data: string[] = [];

        if (data.length >= 300) return;

        for (let i = 0; i < DEFAULT_PAGE_SIZE; i++) {
            // const dataItem: string = `number ${date.getTime().toString().substring(10, 12)}`;
            const dataItem: string = `number ${data.length + i}`;

            if (_data.includes(dataItem)) console.log('중복 데이터 발생');

            // @ts-ignore
            _data.push(dataItem);
        }

        const mergeArr = data.concat(_data);
        setData(mergeArr);
    };

    return (
        <div>
            <div>Header</div>
            <button
                onClick={() => {
                    setStartIdx(45);
                    // console.log(scrollElement.current?.scrollHeight);
                }}
            >
                scroll 이동
            </button>
            <HiddenScrollbar
                ref={scrollElement}
                className="virtual-scroller"
                style={{ height: 600 }}
                onScroll={useHandleOnScrollHeight(() => handleOnScroll(), 85)}
            >
                <div ref={viewportElement} className="virtual-box">
                    <table className="virtual-table">
                        <colgroup>
                            <col />
                        </colgroup>
                        <FixedVirtualScroller
                            componentType="tbody"
                            className="row-container"
                            scrollContainerRef={scrollElement}
                            viewportContainerRef={viewportElement}
                            data={data}
                            rowHeight={60}
                            buffer={5}
                            firstVisibleRowIndex={startIdx}
                            createRowElement={(item: string, index) => <TableRow key={index} item={item} />}
                            // onChangeRenderCallback={({ first, last }) => console.log('>>>>>>>>>>', first, last)}
                        />
                    </table>
                </div>
            </HiddenScrollbar>
        </div>
    );
}

export default App;
