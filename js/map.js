var ad_map;
var ad_markers = [];

// ================= INIT MAP =================
function initMap() {

    ad_map = new google.maps.Map(document.getElementById("ad_mapContainer"), {
        zoom: 4,
        center: { lat: 39.8283, lng: -98.5795 } // USA center
    });

    // Load markers from JSON
    loadMapMarkers();
}


// ================= LOAD MARKERS =================
function loadMapMarkers() {

    fetch("json/data.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            var locations = data.locations;

            // Loop through all stadiums
            for (var i = 0; i < locations.length; i++) {

                addMarker(locations[i]);
            }
        });
}


// ================= ADD MARKER =================
function addMarker(location) {

    // Create marker
    var marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: ad_map,
        title: location.stadium,

        // Custom marker icon 
        icon: {
            url: "images/markers/stadium.png",
            scaledSize: new google.maps.Size(40, 40)
        }
    });

    // Info window =popup when clicked

    var infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="width:200px;">
                <h3>${location.stadium}</h3>
                <p>${location.city}</p>
                <img src="${location.image}" style="width:100%;">
            </div>
        `
    });

    // Click event
    marker.addListener("click", function() {
        infoWindow.open(ad_map, marker);
    });

    // Store marker 
    ad_markers.push(marker);
}