export interface IConsoleItem {
    type: 'standard' | 'error' | 'success',
    message: string;
}

interface IConsole {
    messages: IConsoleItem[];
}

function Console({messages}: IConsole) {
    const rendered = [];
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
        rendered.push(<div key={i} className={bsClass}>{item.message}</div>)
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