import React, { useEffect, useRef } from 'react';
import './style.css'; // Add your styles here

const Popup = ({ isVisible, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    // Close popup if clicked outside
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!isVisible) return null;
  return (
    <div className="popup-overlay">
      <div className="popup" ref={popupRef}>
        <button className="popup-close" onClick={onClose}>×</button>
        <h2>Earthquake Data Visualization</h2>
        <p>This application visualizes earthquake data provided by the <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noopener noreferrer">USGS Earthquake Feed</a></p>
        <p><strong>Features:</strong></p>
        <ul>
          <li><strong>Dynamic Visualization:</strong> See the location of recent earthquakes on an interactive map.</li>
          <li><strong>Control Layers:</strong> Toggle additional data layers, including:
            <ul>
              <li>Basemaps</li>
              <li>Heatmaps</li>
              <li>Tectonic plates</li>
              <li>Earthquake clusters/events</li>
            </ul>
          </li>
          <li><strong>Filtering Options:</strong> View events within a specific magnitude / depth range.</li>
          <li><strong>Risk Management:</strong> Draw polygons around earthquakes of interest to count buildings within the area for risk management.</li>
        </ul>
      </div>
    </div>
  );
  
};

export default Popup;
