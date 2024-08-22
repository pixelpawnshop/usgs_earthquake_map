import React, { useEffect, useRef, useState } from 'react';
import { initializeMap } from './map';
import Table from './Table';  // Import the Table component
import './style.css';
import { filterEarthquakes } from './functions';

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [minMagnitude, setMinMagnitude] = useState('');
  const [maxMagnitude, setMaxMagnitude] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [minDepth, setMinDepth] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const markerClusterGroupRef = useRef(null);
  const heatLayerRef = useRef(null);
  const mapRef = useRef(null); // Reference for the map instance

  useEffect(() => {
    mapRef.current = initializeMap(
      'map',
      setEarthquakes,
      setIsLoading,
      (ref) => markerClusterGroupRef.current = ref,
      (ref) => heatLayerRef.current = ref
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const applyFilter = () => {
    if (earthquakes.length) {
      filterEarthquakes(earthquakes, minMagnitude, maxMagnitude, minDepth, maxDepth, markerClusterGroupRef, heatLayerRef);
    }
  };

  const handleRowClick = (event) => {
    if (mapRef.current) {
      mapRef.current.setView([event.lat, event.long], 6); // Adjust the zoom level as needed
    }
  };

  return (
    <div>
      <div id="map"></div>
      <div className="filter-controls">
        <h4>
          Earthquake Activity Map Last 30 Days {!isLoading && `- ${earthquakes.length} Events Found`}
        </h4>
        <div className="form-controls">
          <label>
            Min Magnitude:
            <input
              type="number"
              step="0.1"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(e.target.value)}
            />
          </label>
          <label>
            Max Magnitude:
            <input
              type="number"
              step="0.1"
              value={maxMagnitude}
              onChange={(e) => setMaxMagnitude(e.target.value)}
            />
          </label>
          <label>
            Min Depth (km):
            <input
              type="number"
              step="0.1"
              value={minDepth}
              onChange={(e) => setMinDepth(e.target.value)}
            />
          </label>
          <label>
            Max Depth (km):
            <input
              type="number"
              step="0.1"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
            />
          </label>
          <button onClick={applyFilter}>Apply Filter</button>
        </div>
      </div>
      <div className="map-container">
        {isLoading && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
            <p>Loading earthquake data</p>
          </div>
        )}
      </div>
      <div className="table-container">
        <Table earthquakes={earthquakes} onRowClick={handleRowClick} />
      </div>
    </div>
  );
}

export default App;
