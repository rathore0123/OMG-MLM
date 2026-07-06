import { CardHeader,  } from "reactstrap";
import H4 from "../Headings/H4Element";
import { Link } from "react-router-dom";
import CardHeaderDropdown from "./CardHeaderDropdown";
import { CardHeaderCommonType } from "../../Type/Layout/CommonElements/CommonCardHeader";
import { Btn, H2, H6, Image, P } from "../../AbstractElements";
import { dynamicImage } from "../../Service";

const CardHeaderCommon = ({title,subTitle,headClass,mainTitle,firstItem,secondItem,thirdItem,borderClass, coupon, coponcount, Openmodal, ComponentType}:CardHeaderCommonType) => {  
  return (
    <CardHeader className={`${headClass} ${!borderClass === true ? "card-no-border" : ""} `}>
      <div className="d-flex justify-content-between align-items-center"><H4>{title}</H4> 
       {title === "Royalty Achievement" ? <Image style={{width:'30px'}} src={dynamicImage('royalty.png')} alt="award"/> : undefined}
       {title === "Rank Achievement" ? <Image style={{width:'30px'}} src={dynamicImage('rank.png')} alt="award"/> : undefined}
     </div>
      {subTitle && <Link to={`${import.meta.env.BASE_URL}/pages/samplepage`}>{subTitle}</Link> }
      {firstItem &&
      <CardHeaderDropdown mainTitle={mainTitle} firstItem={firstItem} secondItem={secondItem} thirdItem={thirdItem} />}
    </CardHeader>
  );
};

export default CardHeaderCommon;
