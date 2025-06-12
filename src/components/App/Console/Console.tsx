import { JSX } from "react";

export interface IConsoleItem {
    type: 'standard' | 'error' | 'success',
    message: string;
}

interface IConsole {
    messages: IConsoleItem[];
}

function Console({messages}: IConsole) {
    const rendered: JSX.Element[] = [];
    for (let i = 0; i < messages.length; i++) {
        const item = messages[i];
        let bsClass;
        switch (item.type) {
            case 'success':
                bsClass = 'text-success';
                break;
            case 'error':
                bsClass = 'text-danger';
                break;
            case 'standard':
                bsClass = '';
                break;
        }
        for (const m of item.message.split('\n')) {
            rendered.push(<div key={i} className={bsClass}>{m}</div>)
        }
    }

    return (
        <div className="card">
            <div className="card-body font-monospace">
                {rendered}
            </div>
        </div>
    );
}

export default Console;