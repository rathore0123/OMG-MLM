// import { Link } from "react-router-dom";
// import { H4, Image, P } from "../../../AbstractElements";
// import { mixLayoutData } from "../../../Data/Layout/ThemeCustomizerData";
// import { dynamicImage } from "../../../Service";
// import { Href, ThemeColorMode } from "../../../utils/Constant";
// import { setMixLayoutType } from "../../../ReduxToolkit/Reducers/ThemeCustomizerSlice";
// import { useAppDispatch } from "../../../ReduxToolkit/Hooks";

// const MixLayout = () => {
//   const dispatch = useAppDispatch();
//   const handleDarkLayout = (item: string) => {
//     dispatch(setMixLayoutType(item));
//   };
//   return (
//     <div className="mb-3 p-2 rounded-3 default-border b-t-primary">
//       <div className="color-header mb-2">
//         <H4>{ThemeColorMode}:</H4>
//         <P className="font-light">Choose between 3 different mix layout.</P>
//       </div>
//       <div className="color-body d-flex align-items-center justify-space-between">
//         {mixLayoutData.map((data, i) => (
//           <div className={`color-img ${data.class}`} key={i}>
//             <Image className="img-fluid" src={dynamicImage(`customizer/${data.image}`)} alt="customizer" />
//             <div className="customizer-overlay" />
//             <div className={`button color-btn ${data.color}-setting`}>
//               <Link to={Href} onClick={() => handleDarkLayout(data.layout)}>
//                 {data.title}
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MixLayout;
