// components/Loader.tsx
import React from 'react';
import './Loader.css'; // Optional for styling

const Loader: React.FC = () => {
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
