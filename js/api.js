// ================= GOOGLE PLACES - STADIUM PHOTO =================
function getStadiumPhoto(stadiumName, cityName, callback) {

    var request = {
        query: stadiumName + " stadium " + cityName,
        fields: ["photos"]
    };

    ad_placesService.findPlaceFromQuery(request, function(results, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0 &&
            results[0].photos &&
            results[0].photos.length > 0) {

            var url = results[0].photos[0].getUrl({
                maxWidth: 1200
            });

            callback(url);

        } else {

            callback("https://source.unsplash.com/1200x600/?football-stadium");
        }
    });
}



// ================= GOOGLE PLACES - FULL PLACE DETAILS =================
function getPlaceDetails(placeId, type, callback) {

    ad_placesService.getDetails({
        placeId: placeId,
        fields: ["name", "rating", "formatted_address", "photos"]
    }, function(result, status) {

        if (status === google.maps.places.PlacesServiceStatus.OK) {

            var photo = "";

            if (result.photos && result.photos.length > 0) {
                photo = result.photos[0].getUrl({
                    maxWidth: 300
                });
            } else {

                if (type === "hotel") {
                    photo = "https://source.unsplash.com/300x200/?hotel";
                } else if (type === "tourist_attraction") {
                    photo = "https://source.unsplash.com/300x200/?tourist";
                } else {
                    photo = "https://source.unsplash.com/300x200/?restaurant";
                }
            }

            callback(result, photo);
        }
    });
}



// ================= EVENTS API (TICKETMASTER ) =================
function getCityEvents(cityName, callback) {


    var apiKey = "ahZwRpJJ0zaOpyF67Tik3uCl59raqKlG";

    
    var url = "https://app.ticketmaster.com/discovery/v2/events.json"
        + "?apikey=" + apiKey
        + "&city=" + cityName
        + "&size=3";

    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(jsonData) {

            var events = [];

            // Check if events exist
            if (jsonData._embedded && jsonData._embedded.events) {
                events = jsonData._embedded.events;
            }

            callback(events);
        })
        .catch(function(error) {

            console.log("Events API error:", error);

            // return empty if error
            callback([]);
        });
}

// ================= GEOAPIFY ROUTE TIME =================
function getTravelTime(lat, lng, callback) {

    //my ticketmaster API KEY 
    var apiKey = "1c57b34713ee49ffb2e2b8c5ea9ef2bf";

    // calculate route from city center to stadium
    // simulate a nearby starting point for demo
    var startLat = lat + 0.02;
    var startLng = lng + 0.02;

    var url = "https://api.geoapify.com/v1/routing?"
        + "waypoints=" + startLat + "," + startLng + "|" + lat + "," + lng
        + "&mode=drive"
        + "&apiKey=" + apiKey;

    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            if (data.features && data.features.length > 0) {

                var distance = data.features[0].properties.distance; // meters
                var time = data.features[0].properties.time; // seconds

                // convert values
                distance = (distance / 1000).toFixed(1);
                time = (time / 60).toFixed(0);

                callback(distance, time);
            } else {
                callback(null, null);
            }
        })
        .catch(function() {
            callback(null, null);
        });
}