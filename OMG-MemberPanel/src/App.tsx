import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import RouterData from "./Routes";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useAppSelector } from "./ReduxToolkit/Hooks";
import { loadTheme } from "./Theme/loadTheme";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

function App() {
  const { mix_layout } = useAppSelector((state) => state.themeCustomizer);

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <>
      <SkeletonTheme
        baseColor={mix_layout === "dark" ? "#22262c" : "#f9f3f2"}
        highlightColor={mix_layout === "dark" ? "#101114" : "#daf5ee"}
      >
        <RouterData />
        <ToastContainer />
      </SkeletonTheme>
    </>
  );
}

export default App;