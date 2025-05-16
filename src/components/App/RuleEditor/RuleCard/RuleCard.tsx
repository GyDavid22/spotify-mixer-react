import { useState } from "react";
import Button from "../../Button/Button";

type RuleType = 'year' | 'popularity';

function RuleCard({stop}: {stop?: boolean}) {
    const [type, setType] = useState<RuleType>('year');
    const [min, setMin] = useState<number>(0);
    const [max, setMax] = useState<number>(9999);
    const [minValue, setMinValue] = useState<number>(NaN);
    const [maxValue, setMaxValue] = useState<number>(NaN);

    function updateType(t: RuleType) {
      setType(t);
      if (t === 'popularity') {
        setMin(0);
        setMax(100);
      } else if (t === 'year') {
        setMin(0);
        setMax(9999);
      }
    }

    return (
        <div className='card'>
          <div className='card-body d-flex flex-column gap-2'>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-1">
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-1">
                <select className="form-control form-select" defaultValue={type} onChange={(e) => updateType(e.target.value as RuleType)}>
                  <option value={'year'}>Year</option>
                  <option value={'popularity'}>Popularity</option>
                </select>
                <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                  Min:
                  <input type="number" className="form-control" min={min} max={isNaN(maxValue) ? max : maxValue} onChange={(e) => setMinValue(parseInt(e.target.value))}></input>
                </div>
                <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                  Max:
                  <input type="number" className="form-control" min={isNaN(minValue) ? min : minValue} max={max} onChange={(e) => setMaxValue(parseInt(e.target.value))}></input>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-center gap-1">
                <Button text="Add subrule" iconName="bi-plus-lg"></Button>
                <Button text="Delete" iconName="bi-trash" styleName="danger"></Button>
              </div>
            </div>
            {!stop && <RuleCard stop={true}></RuleCard>}
            {!stop && <RuleCard stop={true}></RuleCard>}
          </div>
        </div>
    );
}

export default RuleCard;