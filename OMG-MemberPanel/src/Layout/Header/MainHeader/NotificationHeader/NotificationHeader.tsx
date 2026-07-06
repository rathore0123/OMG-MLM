import { Link } from "react-router-dom";
import { Badges, H5, LI, SVG } from "../../../../AbstractElements";
import { Href, Notifications, View } from "../../../../utils/Constant";
import ActivityUpdate from "./ActivityUpdate";
import { useState } from "react";

const NotificationHeader = () => {
  const [show, setShow] = useState(false)
  return (
    <LI className="custom-dropdown" >
      <Link to={Href} onClick={()=>setShow(!show)}>
        <SVG className="svg-color circle-color" iconId="Bell" />
      </Link>
      <Badges pill color="secondary">0</Badges>
      <div className={`custom-menu notification-dropdown py-0 overflow-hidden ${show ? "show" : "" }`}>
        <H5 className="title bg-primary-light"> {Notifications} 
          <Link to={`${import.meta.env.BASE_URL}/chat/privatechats`}>
            <span className="font-primary">{View}</span>
          </Link>
        </H5>
        <ActivityUpdate />
      </div>
    </LI>
  );
};

export default NotificationHeader;
