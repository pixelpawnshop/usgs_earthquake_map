import React, { useEffect, useRef, useState } from 'react';
import { initializeMap } from './map';
import Table from './Table';
import './style.css';
import { filterEarthquakes } from './functions';
import L from 'leaflet'; // Import Leaflet

function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState([]);
  const [minMagnitude, setMinMagnitude] = useState('');
  const [maxMagnitude, setMaxMagnitude] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [minDepth, setMinDepth] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bufferRadius, setBufferRadius] = useState(''); // Buffer radius state
  const markerClusterGroupRef = useRef(null);
  const heatLayerRef = useRef(null);
  const mapRef = useRef(null);

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

  useEffect(() => {
    // Initialize `filteredEarthquakes` with `earthquakes` data when `earthquakes` is set
    setFilteredEarthquakes(earthquakes);
  }, [earthquakes]);

  const applyFilter = () => {
    if (earthquakes.length) {
      const filtered = filterEarthquakes(
        earthquakes, 
        minMagnitude, 
        maxMagnitude, 
        minDepth, 
        maxDepth, 
        startDate, 
        endDate, 
        markerClusterGroupRef, 
        heatLayerRef
      );
      setFilteredEarthquakes(filtered);
    }
  };

  const applyBuffer = () => {
    if (mapRef.current && bufferRadius) {
      const radiusInMeters = bufferRadius * 1000; // Convert km to meters
      earthquakes.forEach(eq => {
        L.circle([eq.lat, eq.long], {
          radius: radiusInMeters,
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.2
        }).addTo(mapRef.current);
      });
    }
  };  

  const handleRowClick = (event) => {
    if (mapRef.current) {
      mapRef.current.setView([event.lat, event.long], 18);
    }
  };

  return (
    <div>
      <div id="map"></div>
      <div className="filter-table-container">
        <div className="filter-controls">
          <h4>
            Earthquake Activity Map Last 30 Days {!isLoading && `- ${earthquakes.length} Events Found`}
          </h4>
          <div className="filter-section">
            <h5>Magnitude</h5>
            <div className="input-group">
              <input
                type="number"
                step="0.1"
                value={minMagnitude}
                onChange={(e) => setMinMagnitude(e.target.value)}
                placeholder="Min"
              />
              <input
                type="number"
                step="0.1"
                value={maxMagnitude}
                onChange={(e) => setMaxMagnitude(e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
          <div className="filter-section">
            <h5>Depth in km</h5>
            <div className="input-group">
              <input
                type="number"
                step="0.1"
                value={minDepth}
                onChange={(e) => setMinDepth(e.target.value)}
                placeholder="Min"
              />
              <input
                type="number"
                step="0.1"
                value={maxDepth}
                onChange={(e) => setMaxDepth(e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
          <div className="filter-section">
            <h5>Date Range</h5>
            <div className="input-group">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="From"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
          <div className="filter-section">
            <h5>Buffer Radius (km)</h5>
            <input
              type="number"
              step="0.1"
              value={bufferRadius}
              onChange={(e) => setBufferRadius(e.target.value)}
              placeholder="Radius"
            />
            <button onClick={applyBuffer}>Apply Buffer</button>
          </div>
          <button onClick={applyFilter}>Apply Filter</button>
        </div>
        <div className="table-container">
          <Table earthquakes={filteredEarthquakes} onRowClick={handleRowClick} />
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
    </div>
  );
}

export default App;
