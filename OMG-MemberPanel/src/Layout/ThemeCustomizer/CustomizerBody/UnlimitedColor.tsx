import { H4, LI, UL } from "../../../AbstractElements";
import { lightColorData } from "../../../Data/Layout/ThemeCustomizerData";
import { PropsLightColor } from "../../../Type/Layout/ThemeCustomizerTypes";
import { UnlimitedColorHeading } from "../../../utils/Constant";

const UnlimitedColor = () => {
  const handleColor = (data:PropsLightColor) => {
    document.documentElement.style.setProperty('--theme-default', data.primary);
    document.documentElement.style.setProperty('--theme-secondary', data.secondary);
  }
  return (
    <div className="customizer-color mb-3 p-2 rounded-3 default-border b-t-primary">
      <div className="color-picker mb-2">
        <H4>{UnlimitedColorHeading}</H4>
      </div>
      <UL className="layout-grid flex-row">
        {lightColorData.map((data,i)=>(
          <LI className="color-layout" data-primary={data.primary} data-secondary={data.secondary} key={i} data-attr={`color-${i+1}`} onClick={()=>handleColor(data)}>
            <div/>
          </LI>
        ))}
      </UL>
    </div>
  );
};

export default UnlimitedColor;
