import { useState, useEffect} from "react";
import { useTranslation } from "react-i18next";
import {Col} from 'reactstrap'
import { LI } from "../../../../AbstractElements";
import { languageData } from "../../../../Data/Layout/LanguageData";
import { LanguageDataType } from "../../../../Type/Layout/Header";
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any; // Declare google as any since it's dynamically loaded
  }
}

  const Language = () => {

  //   useEffect(() => {
  //     // GTranslate settings script inject karein
  //     const settingsScript = document.createElement('script');
  //     settingsScript.innerHTML = `
  //         window.gtranslateSettings = {
  //             "default_language": "en",
  //             "native_language_names": true,
  //             "detect_browser_language": true,
  //             "languages": ["en", "fr", "it", "es", "hi", "ar", "gu"],
  //             "wrapper_selector": ".gtranslate_wrapper",
  //             "switcher_horizontal_position": "right",
  //             "switcher_vertical_position": "top",
  //             "float_switcher_open_direction": "bottom",
  //             "alt_flags": {"en": "usa"}
  //         };
  //     `;
  //     document.body.appendChild(settingsScript);

  //     // GTranslate widget script inject karein
  //     const widgetScript = document.createElement('script');
  //     widgetScript.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
  //     widgetScript.defer = true;
  //     document.body.appendChild(widgetScript);

  //     // Cleanup function to remove scripts
  //     return () => {
  //         document.body.removeChild(settingsScript);
  //         document.body.removeChild(widgetScript);
  //     };
  // }, []);

  return (
    <div>
      {/* <div  id="google_translate_element">
      </div> */}
       {/* <div className="gtranslate_wrapper"></div> */}
    </div>
  );
};

export default Language;
