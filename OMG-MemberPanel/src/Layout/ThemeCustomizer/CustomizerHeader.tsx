import { H4, P } from "../../AbstractElements";
import { CustomizerHeaderProps } from "../../Type/Layout/Sidebar";
import { Href, PreviewSettings } from "../../utils/Constant";

const CustomizerHeader = ({setOpen}:CustomizerHeaderProps) => {
  return (
    <div className="customizer-header">
      <div className="theme-title">
        <div>
          <H4>{PreviewSettings}</H4>
          <P className="mb-0">
            Try It Real Time
            <i className="fa fa-thumbs-up ms-1" />
          </P>
        </div>
        <div className="flex-grow-1">
          <a href={Href} className="icon-btn btn-outline-light button-effect pull-right cog-close" onClick={()=>setOpen(false)}  >
            <i className="fa fa-times" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomizerHeader;
