import { useState } from "react";
import Button from "../../Button/Button";
import './RuleCard.css';
import { RuleType } from "../../../../lib/structures";

// use up... csak ha levél
// megszerezni az ID-t, hogy a label működjön

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
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-1">
              <div className="d-flex flex-column gap-1 flex-grow-1 w-100 w-md-auto">
                <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                  <label>Probability:</label>
                  <div className="input-group">
                    <input type="number" className="form-control" min="0" max="100"></input>
                    <span className="input-group-text">%</span>
                  </div>
                </div>
                <div className="w-100 d-flex flex-column flex-md-row gap-1">
                  <select className="form-control form-select" defaultValue={type} onChange={(e) => updateType(e.target.value as RuleType)}>
                    <option value={'year'}>Year</option>
                    <option value={'popularity'}>Popularity</option>
                  </select>
                  <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                    <label>Min:</label>
                    <input type="number" className="form-control" min={min} max={isNaN(maxValue) ? max : maxValue} onChange={(e) => setMinValue(parseInt(e.target.value))}></input>
                  </div>
                  <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                    <label>Max:</label>
                    <input type="number" className="form-control" min={isNaN(minValue) ? min : minValue} max={max} onChange={(e) => setMaxValue(parseInt(e.target.value))}></input>
                  </div>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input"></input>
                  <label className="form-check-label">Use up all songs before repeating</label>
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