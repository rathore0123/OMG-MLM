import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

// Define the props type
interface CaptchaComponentProps {
  onCaptchaChange: (value: string | null) => void; // Define the type for onCaptchaChange
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = ({ onCaptchaChange }) => {
  const recaptchaRef = useRef<ReCAPTCHA | null>(null); // You can specify the type here
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleCaptchaChange = (value: string | null) => {
    // console.log("Captcha value:", value);
    setCaptchaVerified(true);
    if (onCaptchaChange) {
      onCaptchaChange(value); // Send the value back to the parent component
    }
  };

  const refreshCaptcha = () => {
    // Type assertion to any for reset method
    (recaptchaRef.current as any)?.reset();
    setCaptchaVerified(false);
  };

  return (
    <div className="fxt-transformY-50 fxt-transition-delay-1">
      <div className="captcha-container">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6Lc3WBQqAAAAAMB0_fjYF38ozsvmZ5iLo_TnQ4pS"
          onChange={handleCaptchaChange}
        />
        <button type="button" id="refreshCaptcha" className="refresh-icon" onClick={refreshCaptcha}>
          🔄
        </button>
      </div>
    </div>
  );
};

export default CaptchaComponent;
