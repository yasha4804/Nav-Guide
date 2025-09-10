const map = L.map('map').setView([20.5937, 78.9629], 5); // India view

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let customMarkers = [];
let customPoints = [];
let routeControl;

// Reverse geocoding (get place name from coordinates)
async function getLocationName(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    return data.display_name || "Unknown location";
  } catch (e) {
    return "Unknown location";
  }
}

// Add point manually
const pointForm = document.getElementById('pointForm');
pointForm.addEventListener('submit', async e => {
  let popupText = `<b>${label}</b><br>${locationName}<br>Lat: ${lat}<br>Lng: ${lng}`;
popupText += alt ? `<br>Alt: ${alt} m` : "<br>Alt: N/A";

let altitude = alt ? alt : await getAltitude(lat, lng);
// let popupText = `<b>${label}</b><br>${locationName}<br>
// Lat: ${lat}<br>Lng: ${lng}<br>Alt: ${altitude} m`;

  
  
//     e.preventDefault();
//   const lat = parseFloat(document.getElementById('pointLat').value);
//   const lng = parseFloat(document.getElementById('pointLng').value);
//   const alt = document.getElementById('pointAlt').value;
//   const label = document.getElementById('pointLabel').value || "Custom Point";

  if (!isNaN(lat) && !isNaN(lng)) {
    const locationName = await getLocationName(lat, lng);

    let popupText = `<b>${label}</b><br>${locationName}<br>Lat: ${lat}<br>Lng: ${lng}`;
    popupText += alt ? `<br>Alt: ${alt} m` : "<br>Alt: N/A";

    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(popupText).openPopup();
    map.setView([lat, lng], 14);

    customMarkers.push(marker);
    customPoints.push([lat, lng]);

    drawRoute();
    pointForm.reset();
  } else {
    alert("Please enter valid latitude and longitude.");
  }
});

// Add point by clicking map
map.on("click", async function(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  const locationName = await getLocationName(lat, lng);

  let popupText = `<b>Clicked Point</b><br>${locationName}<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br>Alt: N/A`;

  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(popupText).openPopup();

  customMarkers.push(marker);
  customPoints.push([lat, lng]);

  drawRoute();
});

const calcBtn = document.getElementById('calcBtn');
calcBtn.addEventListener('click', () => {
  if (customPoints.length < 2) {
    alert("Please add at least two points to calculate the shortest path.");
  } else {
    drawRoute();
  }
});


//Draw shortest path route
function drawRoute() {
  if (routeControl) {
    map.removeControl(routeControl);
  }

  if (customPoints.length > 1) {
    routeControl = L.Routing.control({
      waypoints: customPoints.map(p => L.latLng(p[0], p[1])),
      lineOptions: {
        styles: [{ color: 'lime', weight: 4 }]
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      createMarker: () => null
    }).addTo(map);

    // Update route info
    routeControl.on('routesfound', function(e) {
      const route = e.routes[0];
      const distance = (route.summary.totalDistance / 1000).toFixed(2); // km
      const time = (route.summary.totalTime / 60).toFixed(1); // minutes

      document.getElementById('routeDistance').innerText = `Distance: ${distance} km`;
      document.getElementById('routeTime').innerText = `Time: ${time} minutes`;
    });
  }
}

// Reset button
const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', () => {
  customMarkers.forEach(marker => map.removeLayer(marker));
  customMarkers = [];
  customPoints = [];

  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }

  document.getElementById('routeDistance').innerText = "Distance: -";
  document.getElementById('routeTime').innerText = "Time: -";

  alert("All points and routes cleared!");
});


// const streetViewBtn = document.getElementById('streetViewBtn');
// const streetViewModal = document.getElementById('streetViewModal');
// const closeModal = document.getElementById('closeModal');
// const streetFrame = document.getElementById('streetFrame');

// streetViewBtn.addEventListener('click', () => {
//   if (customPoints.length === 0) {
//     alert("Please add at least one point first!");
//     return;
//   }

//   const lastPoint = customPoints[customPoints.length - 1];
//   const lat = lastPoint[0];
//   const lng = lastPoint[1];

//   // Load Google Street View iframe
//   streetFrame.src = `https://www.google.com/maps/embed/v1/streetview?key=YOUR_GOOGLE_MAPS_API_KEY&location=${lat},${lng}&heading=210&pitch=10&fov=80`;

//   streetViewModal.style.display = "block";
// });

// // Close modal
// closeModal.addEventListener('click', () => {
//   streetViewModal.style.display = "none";
//   streetFrame.src = ""; // clear to stop loading
// });


// Get altitude (elevation) from Open-Elevation API
async function getAltitude(lat, lng) {
  try {
    const res = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
    const data = await res.json();
    return data.results[0].elevation || "N/A";
  } catch (e) {
    return "N/A";
  }
}
