import { JSX } from "react";
import './Console.css';

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
            <pre className="card-body console-text">
                {rendered}
            </pre>
        </div>
    );
}

export default Console;