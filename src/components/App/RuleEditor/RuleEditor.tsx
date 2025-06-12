import { getDefaultRule, IRule, IRuleset } from "../../../lib/index";
import Button from "../Button/Button";
import RuleCard from "./RuleCard/RuleCard";

interface IRuleEditor {
    ruleset: IRuleset,
    onChange: (r: IRuleset) => void;
}

function RuleEditor({ ruleset, onChange }: IRuleEditor) {
    const update = (r: Partial<IRuleset>) => {
        const updated = {
            ...ruleset,
            ...r,
        };
        onChange(updated);
    }
    const lengthUpdateHandler = (val: string) => {
        if (val === '') {
            return;
        }
        let newVal = parseInt(val);
        if (newVal < -1) {
            newVal = -1;
        }
        update({length: newVal});
    }
    const onAdd = () => {
        if (ruleset.rules === undefined) {
            ruleset.rules = [];
        }
        ruleset.rules.push(getDefaultRule());
        update({rules: ruleset.rules});
    };
    const childUpdate = (r: IRule, i: number) => {
        const updated = {
            ...ruleset,
            rules: [...ruleset.rules.splice(0, i), r, ...ruleset.rules.slice(i + 1)],
        };
        onChange(updated);
    };
    const childDelete = (i: number) => {
        const updated = {
            ...ruleset,
            rules: [...ruleset.rules.splice(0, i), ...ruleset.rules.slice(i + 1)],
        };
        onChange(updated);
    };

    return (
        <>
            <div className="d-flex gap-1 align-items-center">
                <label htmlFor="ruleset-name">
                    Ruleset name:
                </label>
                <input type="text" className="form-control w-auto" id="ruleset-name" value={ruleset.name} onChange={(e) => { update({name: e.target.value}); }}></input>
            </div>
            <div className="d-flex gap-1 align-items-center">
                <label htmlFor="playlist-length">
                    Playlist length:
                </label>
                <input type="number" className="form-control w-auto" min="-1" id="playlist-length" value={ruleset.length} onChange={(e) => lengthUpdateHandler(e.target.value)} onBlur={(e) => lengthUpdateHandler(e.target.value === '' ? '0' : e.target.value)}></input>
            </div>
            <div className="d-flex gap-1 align-items-center">
                <label htmlFor="playlist-source">
                    Playlist source:
                </label>
                <input type="text" className="form-control w-auto" id="playlist-source" value={ruleset.source} onChange={(e) => { update({source: e.target.value}); }}></input>
            </div>
            { ruleset.rules.map((r, i) => <RuleCard key={i} rule={r} selfIndex={i} onUpdate={childUpdate} onDelete={childDelete}></RuleCard>) }
            <div>
                <Button text='Add rule' iconName='bi-plus-lg' onClick={onAdd}></Button>
            </div>
        </>
    )
}

export default RuleEditor;