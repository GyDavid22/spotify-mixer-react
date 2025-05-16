import Button from "../Button/Button";
import './RulePicker.css'

function RulePicker() {
    return (
        <>
            <div className="d-flex gap-1">
                <Button text="Backup ruleset" iconName="bi-arrow-down"></Button>
                <Button text="Upload ruleset" iconName="bi-arrow-up"></Button>
            </div>
            <label htmlFor="new-rule-name">Create a new rule:</label>
            <div className="d-flex gap-1">
                <input id="new-rule-name" type="text" className="form-control flex-grow-1 rule-picker-input"></input>
                <Button text="Save rule" styleName="success" iconName="bi-save"></Button>
            </div>
            <label htmlFor="select-ruleset">or select an existing rule:</label>
            <div className="d-flex gap-1">
                <select className="form-control form-select flex-grow-1 rule-picker-input" id="select-ruleset" defaultValue={undefined}>
                    <option></option>
                    <option value={0}>Demo option</option>
                </select>
                <Button text="Delete rule" styleName="danger" iconName="bi-trash"></Button>
            </div>
        </>
    );
}

export default RulePicker;