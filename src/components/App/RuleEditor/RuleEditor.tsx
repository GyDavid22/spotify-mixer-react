import Button from "../Button/Button";
import RuleCard from "./RuleCard/RuleCard";

function RuleEditor() {
    return (
        <>
            <RuleCard></RuleCard>
            <RuleCard></RuleCard>
            <div>
                <Button text='Add rule' iconName='bi-plus-lg'></Button>
            </div>
        </>
    )
}

export default RuleEditor;