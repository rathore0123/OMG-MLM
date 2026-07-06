import { Form, Input, Label } from "reactstrap";
import { H4, LI, P, UL } from "../../../AbstractElements";
import { SidebarTypeHeading } from "../../../utils/Constant";
import { sidebarTypeData } from "../../../Data/Layout/ThemeCustomizerData";
import { useAppDispatch } from "../../../ReduxToolkit/Hooks";
import { setLayout } from "../../../ReduxToolkit/Reducers/ThemeCustomizerSlice";

const SidebarType = () => {
  const dispatch= useAppDispatch()
  const handleLayout = (layoutName: string) => {
    dispatch(setLayout(layoutName))
  }
  return (
    <div className="mb-3 p-2 rounded-3 default-border b-t-primary">
      <div className="sidebar-type mb-2">
        <H4>{SidebarTypeHeading}</H4>
        <P className="font-light">Choose between 2 different sidebar types.</P>
      </div>
      <Form>
        <div className="sidebar-body form-check radio ps-0">
          <UL className="radio-wrapper flex-row">
            {sidebarTypeData.map((data,i)=>(
              <LI className={`${data.class}-setting`} key={i} onClick={() => handleLayout(data.title.toLowerCase())}>
                <Input id={data.id} type="radio" name="radio2" defaultChecked={data.checked} />
                <Label className="form-check-label" for={data.id}>
                  <span>{data.title}</span>
                </Label>
              </LI>
            ))}
          </UL>
        </div>
      </Form>
    </div>
  );
};

export default SidebarType;
