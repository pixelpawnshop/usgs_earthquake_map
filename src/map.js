import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { createLegend,getMarkerStyle } from './functions';

export function initializeMap(mapId, setEarthquakes, setIsLoading, setMarkerClusterGroupRef, setHeatLayerRef) {
  const map = L.map(mapId, {
    center: [20, 0],
    zoom: 2,
    maxZoom: 18,
  });

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, and the GIS User Community',
  });

  const markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 15,
    disableClusteringAtZoom: 8,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false
  }).addTo(map);

  const heatLayer = L.heatLayer([], {
    radius: 25,
    blur: 15,
    maxZoom: 17
  }).addTo(map);

  const tectonicLayer = L.geoJSON(null, {
    style: {
      color: '#ff0000',
      weight: 2
    }
  }).addTo(map);

  setMarkerClusterGroupRef(markerClusterGroup);
  setHeatLayerRef(heatLayer);

  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
    .then(response => response.json())
    .then(data => {
      const earthquakeData = data.features.map(feature => {
        const { mag: magnitude, place: title, time } = feature.properties;
        const [long, lat, depthValue] = feature.geometry.coordinates;
        return {
          lat,
          long,
          magnitude,
          depth: depthValue,
          title,
          time
        };
      });

      setEarthquakes(earthquakeData);
      setIsLoading(false);

      const heatmapData = earthquakeData.map(eq => [eq.lat, eq.long, eq.magnitude]);
      heatLayer.setLatLngs(heatmapData);

      markerClusterGroup.clearLayers();

      earthquakeData.forEach(eq => {
        const style = getMarkerStyle(eq.magnitude, eq.depth);
        const marker = L.marker([eq.lat, eq.long], {
          icon: L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: ${style.fillColor}; width: ${style.radius * 2}px; height: ${style.radius * 2}px; border-radius: 50%; border: 2px solid #333;"></div>`,
            iconSize: [style.radius * 2, style.radius * 2]
          }),
          zIndexOffset: eq.magnitude * 1000
        }).bindPopup(
          `<b>${eq.magnitude} ${eq.title}</b><br/>
            Magnitude: ${eq.magnitude}<br/>
            Depth: ${eq.depth} km<br/>
            Time: ${new Date(eq.time).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
          })}`
        );

        marker.on('mouseover', function () {
          const hoverDiv = document.querySelector('.leaflet-control-info');
          hoverDiv.style.display = 'block';
          hoverDiv.innerHTML = `<b>${eq.magnitude} ${eq.title}</b>`;
        })
        .on('mouseout', function () {
          const hoverDiv = document.querySelector('.leaflet-control-info');
          hoverDiv.style.display = 'none';
        });

        markerClusterGroup.addLayer(marker);
      });

      fetch('https://pixelpawnshop.github.io/earthquake_map/plates_boundaries.geojson')
        .then(response => response.json())
        .then(data => {
          tectonicLayer.addData(data);
        })
        .catch(error => console.error('Error fetching GeoJSON', error));

      const baseMaps = {
        "OpenStreetMap": osmLayer,
        "Satellite Imagery": satelliteLayer
      };

      const overlayMaps = {
        "Clusters": markerClusterGroup,
        "Heatmap": heatLayer,
        "Tectonic Plates": tectonicLayer
      };

      if (!map._controlLayers) {
        L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);
      }
    })
    .catch(error => {
      console.error('Error fetching data', error);
      setIsLoading(false);
    });

  const mousePositionControl = L.control({ position: 'bottomleft' });
  mousePositionControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'mouse-position');
    div.innerHTML = 'Lat: 0, Lng: 0';
    return div;
  };
  mousePositionControl.addTo(map);

  map.on('mousemove', function (e) {
    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);
    document.querySelector('.mouse-position').innerHTML = `Lat: ${lat}, Lng: ${lng}`;
  });

  const hoverInfoControl = L.control({ position: 'topleft' });
  hoverInfoControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-control-info');
    div.style.display = 'none';
    return div;
  };
  hoverInfoControl.addTo(map);

  const legend = createLegend();
  legend.addTo(map);

  return map;
}
