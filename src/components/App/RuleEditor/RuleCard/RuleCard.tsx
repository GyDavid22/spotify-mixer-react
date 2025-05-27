import Button from "../../Button/Button";
import './RuleCard.css';
import { getDefaultRule, IRule, RuleType } from "../../../../lib/structures";
import { useState } from "react";

type PropertyTypes = 'probability' | 'min' | 'max';
type Props = {
  [x in PropertyTypes]: string;
};
const Ranges: {
  [x in 'probability' | 'year' | 'popularity']: {
    min: number,
    max: number
  }
} = {
  'probability': {
    min: 0,
    max: 100,
  },
  'year': {
    min: 0,
    max: 9999,
  },
  'popularity': {
    min: 0,
    max: 100,
  },
};

let itemIndex = 0;

interface IRuleCard {
  rule: IRule,
  selfIndex: number,
  onUpdate: (r: IRule, i: number) => void,
  onDelete: (i: number) => void,
};

function RuleCard({rule, selfIndex, onUpdate, onDelete}: IRuleCard) {
  const selfItemIndex = itemIndex++;

  const update = (r: Partial<IRule>) => {
    const updated = {
      ...rule,
      ...r,
    };
    onUpdate(updated, selfIndex);
  };
  const updateChild = (r: Partial<IRule>, i: number) => {
    const updated: IRule = {
      ...rule,
      subrules: [...rule.subrules.slice(0, i), { ...rule.subrules[i], ...r }, ...rule.subrules.slice(i + 1)],
    };
    onUpdate(updated, selfIndex);
  };
  const createChild = () => {
    const updated: IRule = {
      ...rule,
      subrules: [...rule.subrules, getDefaultRule()],
    };
    onUpdate(updated, selfIndex);
  }
  const deleteChild = (i: number) => {
    const updated: IRule = {
      ...rule,
      subrules: [...rule.subrules.slice(0, i), ...rule.subrules.slice(i + 1)],
    };
    onUpdate(updated, selfIndex);
  };
  const deleteSelf = () => {
    onDelete(selfIndex);
  }
  const [props, setProps] = useState<Props>({
    probability: rule.probability?.toString() ?? '',
    min: (rule.min ?? '').toString(),
    max: (rule.max ?? '').toString(),
  });
  const [prevProps, setPrevProps] = useState<Props>(props);
  const updateProp = (s: string, type: PropertyTypes) => {
    if (s !== '') {
      let val = parseInt(s);
      if (type === 'min' || type === 'max') {
        if (val > Ranges[rule.type].max) {
          val = Ranges[rule.type].max;
        } else if (val < Ranges[rule.type].min) {
          val = Ranges[rule.type].min;
        }
      } else if (type === 'probability') {
        if (val > Ranges.probability.max) {
          val = Ranges.probability.max;
        } else if (val < Ranges.probability.min) {
          val = Ranges.probability.min;
        }
      }
      setProps({ ...props, [type]: val.toString() });
      setPrevProps({ ...props, [type]: val.toString() });
      update({ [type]: val });
    } else {
      setProps({ ...props, [type]: '' });
      if (type === 'min' || type === 'max') {
        update({ [type]: null })
      }
    }
  };
  const blurProp = (s: string, type: PropertyTypes) => {
    if (s === '') {
      if (!(type === 'min' || type === 'max')) {
        setProps({...props, [type]: prevProps[type]});        
      }
    } else if (type === 'min' || type === 'max') {
      let val = parseInt(s);
      if (type === 'min' && rule.max && val > rule.max) {
        val = rule.max;
      } else if (type === 'max' && rule.min && val < rule.min) {
        val = rule.min;
      }
      setProps({ ...props, [type]: val.toString() });
      update({ [type]: val });
    }
  };

    return (
        <div className='card'>
          <div className='card-body d-flex flex-column gap-2'>
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-1">
              <div className="d-flex flex-column gap-1 flex-grow-1 w-100 w-md-auto">
                <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                  <label htmlFor={`probability-${selfItemIndex}`}>Probability:</label>
                  <div className="input-group">
                    <input type="number" id={`probability-${selfItemIndex}`} className="form-control" min="0" max="100" value={props.probability} onChange={(e) => { updateProp(e.target.value, 'probability') }} onBlur={(e) => { blurProp(e.target.value, 'probability') }}></input>
                    <span className="input-group-text">%</span>
                  </div>
                </div>
                <div className="w-100 d-flex flex-column flex-md-row gap-1">
                  <select className="form-control form-select" value={rule.type} onChange={(e) => { update({ type: e.target.value as RuleType }) }}>
                    <option value={'year'}>Year</option>
                    <option value={'popularity'}>Popularity</option>
                  </select>
                  <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                    <label htmlFor={`min-${selfItemIndex}`}>Min:</label>
                    <input type="number" id={`min-${selfItemIndex}`} className="form-control" value={props.min} min={Ranges[rule.type].min.toString()} max={props.max.toString() === '' ? Ranges[rule.type].max : props.max.toString()} onChange={(e) => { updateProp(e.target.value, 'min') }} onBlur={(e) => { blurProp(e.target.value, 'min') }}></input>
                  </div>
                  <div className="d-flex w-100 align-items-center justify-content-center gap-1">
                    <label htmlFor={`max-${selfItemIndex}`}>Max:</label>
                    <input type="number" id={`max-${selfItemIndex}`} className="form-control" value={props.max} min={props.min.toString() === '' ? Ranges[rule.type].min.toString() : props.min.toString()} max={Ranges[rule.type].max.toString()} onChange={(e) => { updateProp(e.target.value, 'max') }} onBlur={(e) => { blurProp(e.target.value, 'max') }}></input>
                  </div>
                </div>
                { 
                  !rule.subrules.length &&
                  <div className="form-check">
                    <input type="checkbox" id={`useup-${selfItemIndex}`} className="form-check-input" checked={rule.useUp} onChange={(e) => { update({ useUp: e.target.checked }) }}></input>
                    <label htmlFor={`useup-${selfItemIndex}`} className="form-check-label">Use up all songs before repeating</label>
                  </div>
                }
              </div>
              <div className="d-flex align-items-center justify-content-center gap-1">
                <Button text="Add subrule" iconName="bi-plus-lg" onClick={createChild}></Button>
                <Button text="Delete" iconName="bi-trash" styleName="danger" onClick={deleteSelf}></Button>
              </div>
            </div>
            { rule.subrules.map((r, i) => <RuleCard key={i} rule={r} selfIndex={i} onUpdate={updateChild} onDelete={deleteChild}></RuleCard>) }
          </div>
        </div>
    );
}

export default RuleCard;