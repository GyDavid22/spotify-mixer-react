import { useState } from "react";
import Button from "../Button/Button";

interface IRulePicker {
    rules: {
        name: string,
    }[];
    selectedIndex: number,
    onSave: (name: string) => void;
    onDelete: (index: number) => void;
    onChange: (index: number) => void;
    onDownload: () => void;
    onUpload: () => void;
}

function RulePicker({ rules, selectedIndex, onSave, onDelete, onChange, onDownload, onUpload }: IRulePicker) {
    const [nameField, setNameField] = useState<string>('');
    const [selectValue, setSelectValue] = useState<number>(selectedIndex);
    const selectChangeHandler = (index: number) => {
        setNameField('');
        setSelectValue(index);
        onChange(index);   
    };
    const inputChangeHandler = (val: string) => {
        setSelectValue(-1);
        setNameField(val);
        onChange(-1);
    };
    const saveHandler = () => {
        if (nameField !== '') {
            onSave(nameField);
            setNameField('');
        }
    };
    const deleteHandler = () => {
        const val = selectValue;
        if (val !== -1) {
            selectChangeHandler(-1);
            onDelete(val);   
        }
    };

    return (
        <>
            <div className="d-flex gap-1">
                <Button text="Backup ruleset" iconName="bi-arrow-down" onClick={onDownload}></Button>
                <Button text="Upload ruleset" iconName="bi-arrow-up" onClick={onUpload}></Button>
            </div>
            <label htmlFor="new-ruleset-name">Create a new ruleset:</label>
            <div className="d-flex gap-1">
                <input id="new-ruleset-name" type="text" className="form-control flex-grow-1 w-auto" placeholder="Name of the new ruleset" value={nameField} onChange={(e) => inputChangeHandler(e.target.value)}></input>
                <Button text="Save ruleset" styleName="success" iconName="bi-save" onClick={saveHandler}></Button>
            </div>
            <label htmlFor="select-ruleset">or select an existing ruleset:</label>
            <div className="d-flex gap-1">
                <select className="form-control form-select flex-grow-1 w-auto" id="select-ruleset" value={selectValue} onChange={(e) => selectChangeHandler(parseInt(e.target.value))}>
                    <option value={-1}></option>
                    {
                        (() => {
                            const res = [];
                            for (let i = 0; i < rules.length; i++) {
                                res.push(<option value={i} key={i}>{rules[i].name}</option>)
                            }
                            return res;
                        })()
                    }
                </select>
                <Button text="Delete ruleset" styleName="danger" iconName="bi-trash" onClick={deleteHandler}></Button>
            </div>
        </>
    );
}

export default RulePicker;