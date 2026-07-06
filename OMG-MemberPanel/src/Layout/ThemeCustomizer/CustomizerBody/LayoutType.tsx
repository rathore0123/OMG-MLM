import { Input, Label } from "reactstrap";
import { H4, P } from "../../../AbstractElements";
import { LayoutTypeHeading } from "../../../utils/Constant";
import { layoutTypeData } from "../../../Data/Layout/ThemeCustomizerData";
import { useAppDispatch } from "../../../ReduxToolkit/Hooks";
import { setLayoutType } from "../../../ReduxToolkit/Reducers/ThemeCustomizerSlice";

const LayoutType = () => {
  const dispatch = useAppDispatch()
  return (
    <div className="mb-3 p-2 rounded-3 default-border b-t-primary">
      <div className="theme-layout mb-2">
        <H4>{LayoutTypeHeading}</H4>
        <P className="font-light">Choose between 3 different layout types.</P>
      </div>
      <div className="radio-form checkbox-checked">
        {layoutTypeData.map((data,i)=>(
          <div className={`form-check ${data.class}-setting`} key={i}>
            <Input className="form-check-input" id={data.id} type="radio" name="flexRadioDefault" value={data.class} defaultChecked={data.checked} onChange={(event)=>dispatch(setLayoutType(event.target.value))} />
            <Label for={data.id}>
              {data.title}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutType;
