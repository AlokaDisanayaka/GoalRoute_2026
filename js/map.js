var ad_map;
var ad_markers = [];
var ad_placesService;
var ad_placesMarkers = [];
var ad_currentPlaceType = null;

// ================= INIT MAP =================
function initMap() {

    ad_map = new google.maps.Map(document.getElementById("ad_mapContainer"), {
        zoom: 4,
        center: { lat: 39.8283, lng: -98.5795 } // USA center
    });

    // Create Places service 
    ad_placesService = new google.maps.places.PlacesService(ad_map);
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
        showInfoPanel(location);
    });

    // Store marker 
    ad_markers.push(marker);
}

// ================= TOGGLE PLACES =================
function togglePlaces(type) {

    // If same button clicked → remove markers
    if (ad_currentPlaceType === type) {
        clearPlaceMarkers();
        ad_currentPlaceType = null;
        return;
    }

    // Otherwise load new places
    ad_currentPlaceType = type;

    clearPlaceMarkers();
    searchNearbyPlaces(type);
}
//================== SEARCH NEARBY PLACES =================
function searchNearbyPlaces(type) {

    var request = {
        location: ad_map.getCenter(), // search near map center
        radius: 3000, // 3km radius
        type: type
    };

    ad_placesService.nearbySearch(request, function(results, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {

            for (var i = 0; i < results.length; i++) {
                createPlaceMarker(results[i]);
            }
        }
    });
}

// ================= CREATE PLACE MARKER =================
function createPlaceMarker(place) {

    var marker = new google.maps.Marker({
        map: ad_map,
        position: place.geometry.location
    });

    var infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="width:200px;">
                <h4>${place.name}</h4>
                <p>Rating: ${place.rating || "N/A"}</p>
            </div>
        `
    });

    marker.addListener("click", function() {
        infoWindow.open(ad_map, marker);
    });

    ad_placesMarkers.push(marker);
}

// ================= CLEAR PLACE MARKERS =================
function clearPlaceMarkers() {

    for (var i = 0; i < ad_placesMarkers.length; i++) {
        ad_placesMarkers[i].setMap(null);
    }

    ad_placesMarkers = [];
}
// ================= LOAD NEARBY FOR STADIUM =================
function loadNearbyPlacesForStadium(lat, lng) {

    var request = {
        location: { lat: lat, lng: lng }, // specific stadium location
        radius: 2000,
        type: "restaurant"
    };

    ad_placesService.nearbySearch(request, function(results, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayNearby(results);
        }
    });
}

// ================= DISPLAY NEARBY =================
function displayNearby(places) {

    var container = document.getElementById("ad_nearbyList");

    // Clear old data
    container.innerHTML = "";

    // Loop through places
    for (var i = 0; i < 5; i++) {

        var place = places[i];

        var item = `
            <div>
                <strong>${place.name}</strong><br>
                ⭐ ${place.rating || "N/A"}
            </div>
        `;

        container.innerHTML += item;
    }
}

// ================= CLOSE PANEL =================
function closePanel() {
    document.getElementById("ad_infoPanel").style.bottom = "-100%";
}