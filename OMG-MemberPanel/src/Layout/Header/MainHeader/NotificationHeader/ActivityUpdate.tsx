import { Link } from "react-router-dom";
import { Btn, H5, H6, Image, LI, UL } from "../../../../AbstractElements";
// import { notificationData } from "../../../../Data/Layout/HeaderData";
// import { dynamicImage } from "../../../../Service";
// import { AllNotification, Href } from "../../../../utils/Constant";
// import { ButtonGroup } from "reactstrap";
import { IoIosNotificationsOff } from "react-icons/io";

const ActivityUpdate = () => {
  return (
    <UL className="activity-update">
      <LI className="text-center">
      <IoIosNotificationsOff  size={40}/>
      </LI>
      <LI className="text-center">
        No Notification 
      </LI>
      {/* {notificationData.map((item, i) => (
        <LI className={`d-flex align-items-center b-l-${item.color}`} key={i}>
          <div className="flex-grow-1">
            <span>{item.time}</span>
            <Link to={item.link}>
              <H5>{item.title}</H5>
            </Link>
            <H6>{item.userName}</H6>
          </div>
          <div className="flex-shrink-0">
            <Image className="b-r-15 img-40" src={dynamicImage(`avatar/${item.image}`)} alt="avatar" />
          </div>
        </LI>
      ))} */}
      {/* <LI className="mt-3 d-flex justify-content-center">
        <ButtonGroup>
          <Btn color="secondary" href={Href}>{AllNotification}</Btn>
        </ButtonGroup>
      </LI> */}
    </UL>
  );
};

export default ActivityUpdate;
