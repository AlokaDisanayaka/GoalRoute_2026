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
// This service asks Google Maps to calculate the route.
var ad_directionsService;

// This renderer draws the route line on the map.
var ad_directionsRenderer;

// This array stores the route locations in the order the user clicks them.
var ad_routeStops = [];


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

    // Create the Google Directions service.
    ad_directionsService = new google.maps.DirectionsService();

    // Create the Google Directions renderer and attach it to the map.
    ad_directionsRenderer = new google.maps.DirectionsRenderer({
        map: ad_map
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

    // Start a new route at this stadium.
    startRouteAtStadium(loc);

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

    // Load local events for this host city.
    loadEventsForPanel(loc.city);

    // ================= LOAD TRAVEL TIME =================
getTravelTime(loc.lat, loc.lng, function(distance, time) {

    var container = document.getElementById("ad_travelTime");

    if (!distance) {
        container.innerHTML = "Travel info unavailable";
        return;
    }

    container.innerHTML =
        "🚗 Distance from city centre: " + distance + " km<br>" +
        "⏱ Drive Time: " + time + " mins";
});
    
    // Slide the panel up from the bottom.
    document.getElementById("ad_infoPanel").classList.add("active");
}



// ================= START ROUTE AT STADIUM =================
function startRouteAtStadium(loc) {

    // Remove any old route line from the map.
    if (ad_directionsRenderer) {
        ad_directionsRenderer.setDirections({ routes: [] });
    }

    // Empty old route stops.
    ad_routeStops = [];

    // Add this stadium as the first route stop.
    ad_routeStops.push({
        lat: loc.lat,
        lng: loc.lng
    });

    // Clear old route distance and time text.
    var routeInfo = document.getElementById("ad_routeInfo");

    if (routeInfo) {
        routeInfo.innerHTML = "";
    }
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
        showModal(
            "No Stadium Selected",
            "Please select a stadium before exploring nearby places."
        );
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

    // If the route has no stadium yet, use the selected stadium as the start.
    // This helps if the user selected a stadium tag before clicking places.
    if (ad_routeStops.length === 0 && ad_lastLocation) {
        ad_routeStops.push({
            lat: ad_lastLocation.lat,
            lng: ad_lastLocation.lng
        });
    }

    // Add this clicked nearby place to the route.
    addNearbyStopToRoute(place);

    // Get full place details (needed for photos)
    ad_placesService.getDetails({
        placeId: place.place_id,
        fields: ["name", "rating", "formatted_address", "photos"]
    }, function(result, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {

            var photoUrl = "";

            if (result.photos && result.photos.length > 0) {
                photoUrl = result.photos[0].getUrl({
                    maxWidth: 300
                });
            } else {
                photoUrl = "https://source.unsplash.com/300x200/?restaurant";
            }

            var content = `
                <div style="width:200px; font-family: Arial;">

                    <img src="${photoUrl}" 
                         style="width:100%; height:120px; object-fit:cover; border-radius:10px; margin-bottom:10px;">

                    <strong>${result.name}</strong><br>

                    ⭐ ${result.rating || "N/A"}<br>

                    <small>${result.formatted_address}</small>

                </div>
            `;

            var infoWindow = new google.maps.InfoWindow({
                content: content
            });

            infoWindow.open(ad_map, marker);
        }
    });
});

    ad_placesMarkers.push(marker);
}



// ================= ADD NEARBY STOP TO ROUTE =================
function addNearbyStopToRoute(place) {

    // Get the nearby place latitude and longitude.
    var stopLat = place.geometry.location.lat();
    var stopLng = place.geometry.location.lng();

    // Add this nearby place as the next route stop.
    ad_routeStops.push({
        lat: stopLat,
        lng: stopLng
    });
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



// ================= CALCULATE ROUTE =================
function calculateRoute() {

    // A route needs at least 2 locations.
    if (ad_routeStops.length < 2) {
        showModal(
            "Route Error",
            "Select at least 2 locations"
        );
        return;
    }

    // Get the route results panel.
    var routeInfo = document.getElementById("ad_routeInfo");

    // If the route results panel does not exist, create it above the map.
    if (!routeInfo) {
        routeInfo = document.createElement("div");
        routeInfo.id = "ad_routeInfo";

        var mapContainer = document.getElementById("ad_mapContainer");
        mapContainer.parentNode.insertBefore(routeInfo, mapContainer);
    }

    // Show a loading message while the API calls are running.
    routeInfo.innerHTML = "Calculating route summary...";

    // Call Geoapify three times for three travel modes.
    getGeoapifyRoute("drive", function(driveDistance, driveTime) {

        getGeoapifyRoute("walk", function(walkDistance, walkTime) {

            getGeoapifyRoute("bicycle", function(cycleDistance, cycleTime) {

                // If any route fails, show a simple error message.
                if (!driveDistance || !walkDistance || !cycleDistance) {
                    showModal(
                        "Route Error",
                        "Geoapify could not calculate this route"
                    );

                    routeInfo.innerHTML = "";
                    return;
                }

                // Show all route results in the route panel.
                routeInfo.innerHTML =
                    "<h3>Route Summary</h3>" +
                    "<p>🚗 Driving: " + driveDistance + " km | " + driveTime + " mins</p>" +
                    "<p>🚶 Walking: " + walkDistance + " km | " + walkTime + " mins</p>" +
                    "<p>🚴 Cycling: " + cycleDistance + " km | " + cycleTime + " mins</p>";
            });
        });
    });
}



// ================= GEOAPIFY ROUTE API =================
function getGeoapifyRoute(mode, callback) {

    // Your Geoapify API key.
    var apiKey = "1c57b34713ee49ffb2e2b8c5ea9ef2bf";

    // Build the waypoints text for Geoapify.
    // Format: lat,lng|lat,lng|lat,lng
    var waypointsText = "";

    for (var i = 0; i < ad_routeStops.length; i++) {

        // Add a separator before every stop except the first one.
        if (i > 0) {
            waypointsText = waypointsText + "|";
        }

        waypointsText = waypointsText +
            ad_routeStops[i].lat + "," +
            ad_routeStops[i].lng;
    }

    // Create the Geoapify URL.
    var url = "https://api.geoapify.com/v1/routing"
        + "?waypoints=" + waypointsText
        + "&mode=" + mode
        + "&apiKey=" + apiKey;

    // Call Geoapify using fetch.
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            // Check that Geoapify returned a route.
            if (data.features && data.features.length > 0) {

                var distance = data.features[0].properties.distance;
                var time = data.features[0].properties.time;

                // Convert meters to kilometres.
                distance = (distance / 1000).toFixed(1);

                // Convert seconds to minutes.
                time = Math.round(time / 60);

                callback(distance, time);

            } else {
                callback(null, null);
            }
        })
        .catch(function() {

            // Return empty values if the API request fails.
            callback(null, null);
        });
}

// ================= CLEAR ROUTE =================
function clearRoute() {

    // Remove the route line from the map.
    ad_directionsRenderer.setDirections({ routes: [] });

    // Empty the route stops array.
    ad_routeStops = [];

    // Clear the distance and time text.
    var routeInfo = document.getElementById("ad_routeInfo");

    if (routeInfo) {
        routeInfo.innerHTML = "";
    }
}
// ================= LOAD EVENTS INTO PANEL =================
function loadEventsForPanel(cityName) {

    var container = document.getElementById("ad_eventsList");

    // Show loading message
    container.innerHTML =
        "<p class='ad_nearbyMessage'>Loading local events...</p>";

    // Call API (from api.js)
    getCityEvents(cityName, function(events) {

        var html = "";

        // If no events found
        if (events.length === 0) {

            container.innerHTML =
                "<p class='ad_nearbyMessage'>No events found for this city.</p>";

            return;
        }

        // Loop through events
        for (var i = 0; i < events.length; i++) {

            html += "<div class='ad_nearbyItem'>";

            // Event name
            html += "<strong>" + events[i].name + "</strong><br>";

            // Event date (safe check)
            if (events[i].dates &&
                events[i].dates.start &&
                events[i].dates.start.localDate) {

                html += "<span>📅 "
                    + events[i].dates.start.localDate +
                    "</span><br>";
            }

            // Optional: venue name
            if (events[i]._embedded &&
                events[i]._embedded.venues &&
                events[i]._embedded.venues.length > 0) {

                html += "<span>📍 "
                    + events[i]._embedded.venues[0].name +
                    "</span>";
            }

            html += "</div>";
        }

        container.innerHTML = html;
    });
}
