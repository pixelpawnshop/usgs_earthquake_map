import L from 'leaflet';

// Function to get marker style based on magnitude and depth
export function getMarkerStyle(magnitude, depth) {
  let color;
  let radius;

  if (magnitude >= 8.0) {
    radius = 18;
  } else if (magnitude >= 7.0) {
    radius = 16;
  } else if (magnitude >= 6.1) {
    radius = 14;
  } else if (magnitude >= 5.5) {
    radius = 12;
  } else if (magnitude >= 2.5) {
    radius = 10;
  } else {
    radius = 8;
  }

  if (depth > 90) {
    color = "#6a0d83";
  } else if (depth > 60) {
    color = "#ce4993";
  } else if (depth > 30) {
    color = "#ee5d6c";
  } else if (depth > 10) {
    color = "#fb9062";
  } else {
    color = "#eeaf61";
  }

  return {
    fillColor: color,
    radius
  };
}

// Function to filter earthquakes and update markers and heatmap
// Function to filter earthquakes and update markers and heatmap
export function filterEarthquakes(
  earthquakes,
  minMagnitude,
  maxMagnitude,
  minDepth,
  maxDepth,
  startDate,
  endDate,
  markerClusterGroupRef,
  heatLayerRef
) {
  const minMagnitudeNum = minMagnitude ? parseFloat(minMagnitude) : -Infinity;
  const maxMagnitudeNum = maxMagnitude ? parseFloat(maxMagnitude) : Infinity;
  const minDepthNum = minDepth ? parseFloat(minDepth) : -Infinity;
  const maxDepthNum = maxDepth ? parseFloat(maxDepth) : Infinity;
  const start = startDate ? new Date(startDate).getTime() : -Infinity;
  const end = endDate ? new Date(endDate).getTime() : Infinity;

  // Filter earthquakes based on criteria
  const filtered = earthquakes.filter(eq =>
    (minMagnitude ? eq.magnitude >= minMagnitudeNum : true) &&
    (maxMagnitude ? eq.magnitude <= maxMagnitudeNum : true) &&
    (minDepth ? eq.depth >= minDepthNum : true) &&
    (maxDepth ? eq.depth <= maxDepthNum : true) &&
    (startDate ? new Date(eq.time).getTime() >= start : true) &&
    (endDate ? new Date(eq.time).getTime() <= end : true)
  );

  console.log('Filtered earthquakes:', filtered); // Debug log

  // Update markers and heatmap
  if (markerClusterGroupRef.current) {
    markerClusterGroupRef.current.clearLayers();
    if (heatLayerRef.current) {
      heatLayerRef.current.setLatLngs([]);
    }

    const heatmapData = [];

    filtered.forEach(eq => {
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

      markerClusterGroupRef.current.addLayer(marker);
      heatmapData.push([eq.lat, eq.long, eq.magnitude]);
    });

    if (heatLayerRef.current) {
      heatLayerRef.current.setLatLngs(heatmapData);
      console.log('Updated heatmap data:', heatmapData); // Debug log
    }
  }

  // Return the filtered earthquakes
  return filtered;
}


export function createLegend() {
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const depthLabels = [
      { depth: '> 90 km', color: '#6a0d83' },
      { depth: '60-90 km', color: '#ce4993' },
      { depth: '30-60 km', color: '#ee5d6c' },
      { depth: '10-30 km', color: '#fb9062' },
      { depth: '< 10 km', color: '#eeaf61' }
    ];

    div.innerHTML = '<strong>Depth (km)</strong><br><br>';
    depthLabels.forEach(label => {
      div.innerHTML +=
        `<i style="background: ${label.color}; width: 18px; height: 18px; border-radius: 50%; display: inline-block; margin-right: 5px;"></i> ${label.depth}<br>`;
    });

    return div;
  };

  return legend;
}
