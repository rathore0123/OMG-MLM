import { Link } from "react-router-dom";
import { Href } from "../../../utils/Constant";
import { useAppDispatch, useAppSelector } from "../../../ReduxToolkit/Hooks";
import { setSidebarClose } from "../../../ReduxToolkit/Reducers/LayoutSlice";

const CloseButton = () => {
  const {sidebarClose} = useAppSelector((state)=> state.layout)
  const dispatch = useAppDispatch()
  return (
    <Link className="close-btn" to={Href} > 
      {/* <div className={`toggle-sidebar ${sidebarClose ? "close" : ""}`} onClick={()=>dispatch(setSidebarClose(!sidebarClose))}> */}
      <div className='toggle-sidebar' onClick={()=>dispatch(setSidebarClose(!sidebarClose))}>
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
    </Link>
  );
};

export default CloseButton;
