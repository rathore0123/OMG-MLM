import { Input, Label } from "reactstrap";
import { H4, LI, P, SVG, UL } from "../../../AbstractElements";
import { sidebarIconData } from "../../../Data/Layout/ThemeCustomizerData";
import { useAppDispatch } from "../../../ReduxToolkit/Hooks";
import { addSidebarIconType } from "../../../ReduxToolkit/Reducers/ThemeCustomizerSlice";
import { SidebarIconHeading } from "../../../utils/Constant";

const SidebarIcon = () => {
  const dispatch = useAppDispatch()
  return (
    <div className="mb-3 p-2 rounded-3 default-border b-t-primary">
      <div className="sidebar-icon mb-2">
        <H4>{SidebarIconHeading}</H4>
        <P className="font-light">Choose between 2 different sidebar icon.</P>
      </div>
      <div className="sidebar-body form-check radio ps-0">
        <UL className="radio-wrapper flex-row" >
          {sidebarIconData.map((data,i)=>(
            <LI className={data.class} key={i} onClick={()=>dispatch(addSidebarIconType(data.title))}>
              <Input id={data.id} type="radio" name="radio2"  defaultChecked={data.check} />
              <Label className="form-check-label" htmlFor={data.id}>
                <SVG className="stroke-icon svg-w-18 me-1" iconId={data.icon} />
                <span>{data.title}</span>
              </Label>
            </LI>
          ))}
        </UL>
      </div>
    </div>
  );
};

export default SidebarIcon;
