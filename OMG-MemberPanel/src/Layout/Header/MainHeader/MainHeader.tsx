import { Col } from "reactstrap";
import SearchInput from "./SearchInput";
import { UL , P, LI} from "../../../AbstractElements";
import { useState } from "react";
import ResponsiveSearch from "./ResponsiveSearch";
import NotificationHeader from "./NotificationHeader/NotificationHeader";
import MessagesHeader from "./MessagesHeader/MessagesHeader";
import UserProfile from "./UserProfile/UserProfile";
import ZoomInOut from "./ZoomInOut/ZoomInOut";
import Language from "./Language/Language";
import LatestNews from '../../../Component/Marquee/MarqueeComponent'
import ThemeChanger from "../../../Component/ThemeChanger/ThemeChanger";
import { useEffect } from "react";
import CloseButton from "../CloseButton/CloseButton";
const MainHeader = () => {
  const [userName, setUserName] = useState(localStorage.getItem('UserName'));
  const [MemberName, setMemberName] = useState (localStorage.getItem('MemberName'))
  return (
    <Col className="page-main-header justify-content-start justify-content-md-between">
      {/* <SearchInput /> */}
      <div className="d-flex gap-2"><CloseButton />
        <LatestNews/></div>
       
      <div className="nav-right">
        <UL className="header-right flex-row simple-list justify-content-md-end overflow-visible gap-2 gap-md-0">
          {/* <LI className="list-group-item Language_List">
          <Language />
          </LI> */}
          <ThemeChanger />
          {/* <DarkMode/> */}
          {/* <ResponsiveSearch /> */}
          <ZoomInOut />  
          {/* <NotificationHeader />  */}
          {/* <BookmarkHeader /> */}
          {/* <CartHeader /> */}
          {/* <MessagesHeader /> */}
          <UserProfile />
        </UL>
      </div>
    </Col>
  );
};

export default MainHeader;
