import React, { useEffect, useRef, useState } from 'react';
import { initializeMap, openMarkerPopup } from './map';
import Popup from './popup';
import Table from './Table';
import './style.css';
import { filterEarthquakes } from './functions';
import { handlePolygonCreation } from './polygonHandler';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

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
  const markerClusterGroupRef = useRef(null);
  const heatLayerRef = useRef(null);
  const mapRef = useRef(null);
  const [showPopup, setShowPopup] = useState(true); // State for popup visibility

  useEffect(() => {
    mapRef.current = initializeMap(
      'map',
      setEarthquakes,
      setIsLoading,
      (ref) => markerClusterGroupRef.current = ref,
      (ref) => heatLayerRef.current = ref
    );

    // Add drawing controls
    const drawnItems = new L.FeatureGroup();
    mapRef.current.addLayer(drawnItems);

    // Create and add the default draw control
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: true,
        marker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
    });
    mapRef.current.addControl(drawControl);

    // Update tooltip text directly after adding the control
    const updateTooltips = () => {
      // Find the tooltip for the polygon draw button
      const polygonButton = document.querySelector('.leaflet-draw-draw-polygon');
      if (polygonButton) {
        polygonButton.title = 'Draw polygon to count number of buildings in AOI'; // Update tooltip text
      }
    };

    // Call updateTooltips when the control is added
    updateTooltips();

    // Event listener for when a polygon is drawn
    mapRef.current.on(L.Draw.Event.CREATED, (e) => handlePolygonCreation(e, drawnItems));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
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

  const handleRowClick = (event) => {
    if (mapRef.current) {
      mapRef.current.setView([event.lat, event.long], 18);
    }
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    openMarkerPopup(event.id); // Ensure the event has a unique ID or marker ID to open the popup
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
  };
  return (
    <div>
      <div id="map"></div>
      <Popup isVisible={showPopup} onClose={handleClosePopup} /> {/* Popup component */}
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
