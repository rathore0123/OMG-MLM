import { Link } from "react-router-dom";
import { Badges, H5, H6, LI } from "../../../../AbstractElements";
import SvgIcon from "../../../../CommonElements/SVG/SvgIcon";
import { messagesHeaderData } from "../../../../Data/Layout/HeaderData";
import { Href } from "../../../../utils/Constant";

const MessagesBox = () => {
  return (
    <>
      {messagesHeaderData.map((item, i) => (
        <LI className={`d-flex b-t-${item.borderColor}`} key={i}>
          <div className="d-block">
            <Link to={Href}>
              <H5>{item.title}</H5>
            </Link>
            <H6>
              <SvgIcon className="feather me-1" iconId="clock" />
              <span>{item.time}</span>
            </H6>
          </div>
          <Badges className="d-flex align-items-center" color={`light-${item.status === "Open" ? "danger" : "success"}`}>
            <SvgIcon className="feather me-1" iconId="clock" />
            <span>{item.status}</span>
          </Badges>
        </LI>
      ))}
    </>
  );
};

export default MessagesBox;
