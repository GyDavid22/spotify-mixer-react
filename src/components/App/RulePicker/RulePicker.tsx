import Button from "../Button/Button";

function RulePicker() {
    return (
        <>
            <label htmlFor="new-rule-name">Create a new rule:</label>
            <div className="d-flex gap-1">
                <input id="new-rule-name" type="text" className="form-control flex-grow-1"></input>
                <Button text="Save rule" styleName="success" iconName="bi-save"></Button>
            </div>
            <label htmlFor="select-ruleset">or select an existing rule:</label>
            <div className="d-flex gap-1">
                <select className="form-control form-select flex-grow-1" id="select-ruleset" defaultValue={undefined}>
                    <option></option>
                    <option value={0}>Demo option</option>
                </select>
                <Button text="Delete rule" styleName="danger" iconName="bi-trash"></Button>
            </div>
        </>
    );
}

export default RulePicker;