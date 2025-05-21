import Button from "../Button/Button";
import RuleCard from "./RuleCard/RuleCard";

function RuleEditor() {
    return (
        <>
            <div className="d-flex gap-1 align-items-center">
                <label htmlFor="ruleset-name">
                    Ruleset name:
                </label>
                <input type="text" className="form-control w-auto" id="ruleset-name"></input>
            </div>
            <div className="d-flex gap-1 align-items-center">
                <label htmlFor="playlist-length">
                    Playlist length:
                </label>
                <input type="number" className="form-control w-auto" min="-1" id="playlist-length"></input>
            </div>
            <RuleCard></RuleCard>
            <RuleCard></RuleCard>
            <div>
                <Button text='Add rule' iconName='bi-plus-lg'></Button>
            </div>
        </>
    )
}

export default RuleEditor;