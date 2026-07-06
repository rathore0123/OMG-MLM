import { Link } from "react-router-dom";
import { Badges, H5, LI, SVG, UL } from "../../../../AbstractElements";
import { Href, Messages } from "../../../../utils/Constant";
import { useState } from "react";
import MessagesBox from "./MessagesBox";

const MessagesHeader = () => {
  const [show,setShow] = useState(false)
  return (
    <LI className="custom-dropdown">
      <Link to={Href} onClick={()=>setShow(!show)}>
        <SVG className="svg-color" iconId="Message" />
      </Link>
      <Badges pill color="tertiary">3</Badges>
      <div className={`custom-menu message-dropdown py-0 overflow-hidden ${show ? "show" : ""}`}>
        <H5 className="title bg-primary-light">{Messages}</H5>
        <UL>
          <MessagesBox />
        </UL>
      </div>
    </LI>
  );
};

export default MessagesHeader;
