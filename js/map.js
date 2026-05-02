// ================= GLOBAL MAP VARIABLES =================

// This variable stores the Google Map.
var ad_map;

// This service is used for Google Places API searches.
var ad_placesService;

// This array stores nearby place markers, such as restaurants and hotels.
var ad_placesMarkers = [];

// This stores the last selected stadium location.
var ad_lastLocation = null;

// This stores the current nearby place type selected by the user.
var ad_currentType = null;

// Local fallback image used if Google Places has no stadium photo.
var ad_fallbackImage = "images/hero.jpg";



// ================= INIT MAP =================
function initMap() {

    // Create the map centered on North America.
    ad_map = new google.maps.Map(document.getElementById("ad_mapContainer"), {
        zoom: 4,
        center: {
            lat: 39,
            lng: -98
        }
    });

    // Start the Google Places service.
    ad_placesService = new google.maps.places.PlacesService(ad_map);

    // Add the stadium markers to the map.
    loadMapMarkers();
}



// ================= LOAD STADIUM MARKERS =================
function loadMapMarkers() {

    // Load the same stadium data used by the cards.
    fetch("json/data.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            var locations = data.locations;

            // Add one marker for each stadium.
            for (var i = 0; i < locations.length; i++) {
                addMarker(locations[i]);
            }
        });
}



// ================= ADD STADIUM MARKER =================
function addMarker(loc) {

    var marker = new google.maps.Marker({
        position: {
            lat: loc.lat,
            lng: loc.lng
        },
        map: ad_map,

        // Use the custom stadium icon from the images folder.
        icon: {
            url: "images/stadiumIC.png",
            scaledSize: new google.maps.Size(40, 40)
        },

        // This helps users understand the marker when hovering.
        title: loc.stadium
    });

    // A marker click opens the info panel.
    marker.addListener("click", function() {

        // Move and zoom the map to the selected marker.
        ad_map.panTo({
            lat: loc.lat,
            lng: loc.lng
        });
        ad_map.setZoom(14);

        // Open the panel with the stadium details.
        showInfoPanel(loc);
    });
}



// ================= SHOW INFO PANEL =================
function showInfoPanel(loc) {

    // Save this stadium location for the nearby places buttons.
    ad_lastLocation = {
        lat: loc.lat,
        lng: loc.lng
    };

    // Display the stadium name.
    document.getElementById("ad_placeTitle").innerHTML = loc.stadium;

    // Display the city and a short clear description.
    document.getElementById("ad_placeDetails").innerHTML =
    "📍 " + loc.city +
    "<br>🏟 " + loc.description +
    "<br>🎟 Avg Ticket: $" + loc.price;

    // Set the fallback image first 
    document.getElementById("ad_placeImage").src = ad_fallbackImage;

    // Load a high-quality Google Places stadium photo.
    loadStadiumPhoto(loc.stadium, loc.city);

    // Load nearby restaurants for this stadium.
    loadNearbyRestaurants(loc.lat, loc.lng);

    // Slide the panel up from the bottom.
    document.getElementById("ad_infoPanel").classList.add("active");
}



// ================= LOAD HIGH QUALITY STADIUM PHOTO =================
function loadStadiumPhoto(stadiumName, cityName) {

    // Build a stronger search query
    var request = {
        query: stadiumName + " stadium " + cityName,
        fields: ["name", "photos"]
    };

    ad_placesService.findPlaceFromQuery(request, function(results, status) {

        console.log("Photo search status:", status);
        console.log("Results:", results);

        if (status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0 &&
            results[0].photos &&
            results[0].photos.length > 0) {

            // High-quality image
            var photoUrl = results[0].photos[0].getUrl({
                maxWidth: 1200
            });

            document.getElementById("ad_placeImage").src = photoUrl;

        } else {

            // If Google Places has no photo, use a relevant image from Unsplash as a fallback.
            document.getElementById("ad_placeImage").src =
                "https://source.unsplash.com/1200x600/?football-stadium";
        }
    });
}


// ================= LOAD NEARBY RESTAURANTS FOR PANEL =================
function loadNearbyRestaurants(lat, lng) {

    var container = document.getElementById("ad_nearbyList");

    // Show a loading message while Google Places returns results.
    container.innerHTML = "<p class='ad_nearbyMessage'>Loading nearby restaurants...</p>";

    var request = {
        location: {
            lat: lat,
            lng: lng
        },
        radius: 2000,
        type: "restaurant"
    };

    ad_placesService.nearbySearch(request, function(results, status) {

        var html = "";
        var limit = 5;

        if (status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0) {

            // Do not try to show more restaurants than Google returns.
            if (results.length < limit) {
                limit = results.length;
            }

            for (var i = 0; i < limit; i++) {

                var place = results[i];
                var rating = "No rating yet";

                if (place.rating) {
                    rating = place.rating + " / 5";
                }

                html += "<div class='ad_nearbyItem'>";
                html += "<strong>" + place.name + "</strong>";
                html += "<span>Rating: " + rating + "</span>";
                html += "</div>";
            }

            container.innerHTML = html;

        } else {

            container.innerHTML =
                "<p class='ad_nearbyMessage'>No nearby restaurants found.</p>";
        }
    });
}



// ================= TOGGLE NEARBY PLACE MARKERS =================
function togglePlaces(type) {

    // If the same button is clicked again, remove those markers.
    if (ad_currentType === type) {
        clearPlaceMarkers();
        ad_currentType = null;
        return;
    }

    // Save the selected nearby place type.
    ad_currentType = type;

    // Remove old nearby markers before adding new ones.
    clearPlaceMarkers();

    // Ask the user to select a stadium first.
    if (!ad_lastLocation) {
        alert("Please select a stadium first.");
        return;
    }

    var request = {
        location: ad_lastLocation,
        radius: 3000,
        type: type
    };

    ad_placesService.nearbySearch(request, function(results, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {

            for (var i = 0; i < results.length; i++) {
                createPlaceMarker(results[i]);
            }
        }
    });
}



// ================= CREATE NEARBY PLACE MARKER =================
function createPlaceMarker(place) {

    var iconUrl = "";

    // Choose the icon that matches the selected nearby place type.
    if (ad_currentType === "restaurant") {
        iconUrl = "images/restaurantIC.png";
    }

    if (ad_currentType === "hotel") {
        iconUrl = "images/hotelIC.png";
    }

    if (ad_currentType === "tourist_attraction") {
        iconUrl = "images/tourist_attractionIC.png";
    }

    var marker = new google.maps.Marker({
        map: ad_map,
        position: place.geometry.location,
        icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    var rating = "No rating yet";

    if (place.rating) {
        rating = place.rating + " / 5";
    }

    // Small Google Maps popup for nearby places.
    var infoWindow = new google.maps.InfoWindow({
        content:
            "<div class='ad_mapPopup'>" +
            "<strong>" + place.name + "</strong><br>" +
            "Rating: " + rating +
            "</div>"
    });

    marker.addListener("click", function() {
        infoWindow.open(ad_map, marker);
    });

    ad_placesMarkers.push(marker);
}



// ================= CLEAR NEARBY PLACE MARKERS =================
function clearPlaceMarkers() {

    for (var i = 0; i < ad_placesMarkers.length; i++) {
        ad_placesMarkers[i].setMap(null);
    }

    ad_placesMarkers = [];
}



// ================= CLOSE INFO PANEL =================
function closePanel() {

    document.getElementById("ad_infoPanel").classList.remove("active");
}
