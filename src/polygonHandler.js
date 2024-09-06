// polygonHandler.js
import L from 'leaflet';

async function fetchBuildingsInPolygon(polygon) {
    try {
      // Convert polygon coordinates to latitude longitude format with spaces
      const coordinates = polygon.map(coord => `${coord[0]} ${coord[1]}`).join(' ');
  
      // Construct the Overpass API query with specific building types
      const query = `[out:json];
      (
        node["amenity"="fire_station"](poly:"${coordinates}");
        way["amenity"="fire_station"](poly:"${coordinates}");
        relation["amenity"="fire_station"](poly:"${coordinates}");
        node["amenity"="police"](poly:"${coordinates}");
        way["amenity"="police"](poly:"${coordinates}");
        relation["amenity"="police"](poly:"${coordinates}");
        node["amenity"="hospital"](poly:"${coordinates}");
        way["amenity"="hospital"](poly:"${coordinates}");
        relation["amenity"="hospital"](poly:"${coordinates}");
        node["amenity"="school"](poly:"${coordinates}");
        way["amenity"="school"](poly:"${coordinates}");
        relation["amenity"="school"](poly:"${coordinates}");
        node["amenity"="pharmacy"](poly:"${coordinates}");
        way["amenity"="pharmacy"](poly:"${coordinates}");
        relation["amenity"="pharmacy"](poly:"${coordinates}");
        node["amenity"="fuel"](poly:"${coordinates}"); // Added for gas stations
        way["amenity"="fuel"](poly:"${coordinates}"); // Added for gas stations
        relation["amenity"="fuel"](poly:"${coordinates}"); // Added for gas stations
      );
      out body; >; out skel qt;`;
  
      // Encode the query
      const encodedQuery = encodeURIComponent(query)
        .replace(/%20/g, ' ')
        .replace(/%3B/g, ';')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')')
        .replace(/%3A/g, ':')
        .replace(/%3C/g, '<')
        .replace(/%3E/g, '>')
        .replace(/%5B/g, '[')
        .replace(/%5D/g, ']');
  
      const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
  
      // Fetch data from Overpass API
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Overpass API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }
  }

export async function handlePolygonCreation(e, drawnItems) {
  const type = e.layerType;
  const layer = e.layer;

  if (type === 'polygon') {
    const latlngs = layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]);

    try {
      const buildings = await fetchBuildingsInPolygon(latlngs);

      // Count the number of different categories of buildings
      const buildingCounts = {
        fireStation: buildings.elements.filter(element => element.tags && element.tags.amenity === 'fire_station').length,
        policeStation: buildings.elements.filter(element => element.tags && element.tags.amenity === 'police').length,
        hospital: buildings.elements.filter(element => element.tags && element.tags.amenity === 'hospital').length,
        school: buildings.elements.filter(element => element.tags && element.tags.amenity === 'school').length,
        pharmacy: buildings.elements.filter(element => element.tags && element.tags.amenity === 'pharmacy').length,
        gasStation: buildings.elements.filter(element => element.tags && element.tags.amenity === 'fuel').length,
      };

      // Calculate area and format numbers
      const areaInKm2 = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) / 1e6;

      layer.bindPopup(`
        Fire Stations: ${new Intl.NumberFormat('en-US').format(buildingCounts.fireStation)}<br>
        Police Stations: ${new Intl.NumberFormat('en-US').format(buildingCounts.policeStation)}<br>
        Hospitals: ${new Intl.NumberFormat('en-US').format(buildingCounts.hospital)}<br>
        Schools: ${new Intl.NumberFormat('en-US').format(buildingCounts.school)}<br>
        Pharmacies: ${new Intl.NumberFormat('en-US').format(buildingCounts.pharmacy)}<br>
        Gas Stations: ${new Intl.NumberFormat('en-US').format(buildingCounts.gasStation)}<br>
        Area: ${new Intl.NumberFormat('en-US').format(Math.round(areaInKm2))} km²
      `).openPopup();
    } catch (error) {
      console.error('Error occurred while fetching building data:', error);
      layer.bindPopup('Error fetching building data').openPopup();
    }
  }

  drawnItems.addLayer(layer);
}
