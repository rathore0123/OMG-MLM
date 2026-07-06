import React from "react";
import { CardHeader } from "reactstrap";
import { H4, P } from "../../AbstractElements";
import { CommonCardHeaderProp } from "../../Type/Profile/ProfileType";

const CardHeaderCommon: React.FC<CommonCardHeaderProp> = ({ title, span, headClass, icon, tagClass }) => {
  return (
    <CardHeader className={headClass ? headClass : ""}>
      <H4 className={tagClass ? tagClass : "mb-0"}>{icon && icon}{title}</H4>
      {span && (
        <P className="desc mb-0 mt-1">
          {span.map((data, index) => (
            <span key={index}>
              {data?.text} {data.code && <code>{data.code}</code>} {data.mark && <mark>{data.mark}</mark>}
            </span>
          ))}
        </P>
      )}
    </CardHeader>
  );
};

export default CardHeaderCommon;