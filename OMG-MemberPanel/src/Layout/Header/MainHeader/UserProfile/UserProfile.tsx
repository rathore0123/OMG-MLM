import { useState } from "react";
import { H5, Image, LI, P , Btn} from "../../../../AbstractElements";
import { dynamicImage } from "../../../../Service";
import UserProfileIcons from "./UserProfileIcons";
import { useProfile } from "../../../../Context/ProfileContext";

const UserProfile = () => {
  const { avatarUrl, profile } = useProfile();
  const [show,setShow] =  useState(false)
  const [userName, setUserName] = useState(localStorage.getItem('UserName'));
  const [MemberName, setMemberName] = useState (localStorage.getItem('MemberName'))
  const [MemberEmail, setMemberEmail] =useState(localStorage.getItem('memberemail'))
  const [RankName, setRankName] = useState(localStorage.getItem('RankName'))
  return (
    <LI className="profile-dropdown custom-dropdown">
      <div className="d-flex align-items-center" onClick={()=>setShow(!show)}>
        <Image src={avatarUrl} alt="avatar" style={{width:'40px', height:'40px', borderRadius:'100px'}} />
        <div className="flex-grow-1 d-block">
         <div>
          <span>[{userName}]</span>
         {/* <span>{MemberName} <br></br></span> */}
          </div>
          {/* <div>
            <P style={{fontSize:10, fontWeight:500}}>{MemberEmail}</P>
          </div> */}
        </div>
      </div>
      <div className={`custom-menu overflow-hidden ${show? "show" : ""}`}>
        <UserProfileIcons />
      </div>
    </LI>
  );
};

export default UserProfile;
