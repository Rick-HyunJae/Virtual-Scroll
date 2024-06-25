import React from 'react';

export default function TableRow({ item }: { item: string }) {
    return (
        <tr className="row-content">
            <td>{item}</td>
        </tr>
    );
}
