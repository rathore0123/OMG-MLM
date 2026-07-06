import { coursesHighlightedBodyData } from "../../../../Data/Dashboard/Dashboard";
import { Btn, H6, Image } from "../../../../AbstractElements";
import { dynamicImage } from "../../../../Service";
import { Link } from "react-router-dom";
import { Href } from "../../../../utils/Constant";

const CoursesHighlightedBody = (props: any) => {
  return (
    <>
      {props?.data.map((item: any, i: number) => (
        <tr key={i}>
          <td>
            <div className="d-flex align-items-center gap-2">
              <div className="flex-shrink-0">
                <i className="fa fa-google-wallet f-24"></i>
              </div>
              <div className="flex-grow-1">

                <Link to={`https://tronscan.org/#/transaction/${item.txid_in}`} target="_blank">
                  <H6 className="f-w-500">{item.txid_in}</H6>
                </Link>
              </div>
            </div>
          </td>
          <td>{item.value_coin}</td>
          <td>{item.Date}</td>
          <td>
            <Btn className={`edge-btn f-13 w-100`}>
              {item.Status}
            </Btn>
          </td>
        </tr>
      ))}
    </>
  );
};

export default CoursesHighlightedBody;
