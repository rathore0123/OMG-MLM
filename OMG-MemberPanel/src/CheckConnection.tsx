import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ConnectionStatusChecker = () => {
  const navigate = useNavigate();

  // Function to check and handle connection status
  const checkConnectionStatus = () => {
    // console.log(navigator);
    
    
    if (!navigator.onLine) {
      // Redirect to "Connection Lost" page when offline
      navigate(`${import.meta.env.BASE_URL}/connection-lost`);
    }
  };

  useEffect(() => {
    // Initial connection status check
    checkConnectionStatus();

    // Listen for connection changes
    const handleOnline = () => {
      // Optionally redirect back to the main page or show a notification
      // console.log('Connection restored!');
      navigate(`${import.meta.env.BASE_URL}/dashboard`);
    };

    const handleOffline = () => {
      // Redirect to the connection lost page when offline
      // console.log('Connection lost!');
      navigate(`${import.meta.env.BASE_URL}/connection-lost`);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners when the component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    
  }, [navigate]);

  return null; // No UI needed, this runs in the background
};

export default ConnectionStatusChecker;
