// ================= GLOBAL DATA =================

// This array stores all stadium data after it is loaded from the JSON file.
var locationsData = [];



// ================= LOAD JSON DATA =================
function loadData() {

    // Get the stadium data from the JSON file.
    fetch("json/data.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            // Save the locations so other functions can use them.
            locationsData = data.locations;

            // Show all stadium cards on the page.
           displayTags(locationsData);
        });
}



// ================= DISPLAY STADIUM CARDS =================
function displayCards(data) {

    var container = document.getElementById("ad_cardsContainer");
    var html = "";

    // Clear old cards before adding new ones.
    container.innerHTML = "";

    // Build one simple card for each stadium.
    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += "<div class='ad_card' onclick='selectStadium(" + item.id + ")'>";
        html += "<h3>" + item.city + "</h3>";
        html += "<p>" + item.stadium + "</p>";
        html += "</div>";
    }

    container.innerHTML = html;
}



// ================= CARD CLICK BEHAVIOUR =================
function selectStadium(id) {

    // Find the stadium that matches the clicked card.
    for (var i = 0; i < locationsData.length; i++) {

        if (locationsData[i].id === id) {

            var loc = locationsData[i];

            // Move the map to the stadium location.
            ad_map.panTo({
                lat: loc.lat,
                lng: loc.lng
            });

            // Zoom in so the selected stadium is easy to see.
            ad_map.setZoom(13);

            // Save this location for the nearby places buttons.
            ad_lastLocation = {
                lat: loc.lat,
                lng: loc.lng
            };

        
        }
    }
}



function selectCountry(country) {

    var filtered = locationsData.filter(function(item) {
        return item.country === country;
    });

    // Show tags instead of cards
    displayTags(filtered);
}

// ================= MOBILE MENU =================
function toggleMenu() {

    var menu = document.querySelector(".ad_menu");

    if (menu.style.display === "flex") {
        menu.style.display = "none";
    } else {
        menu.style.display = "flex";
    }
}



// ================= SCROLL TO CARDS =================
function scrollToExplore() {

    document.getElementById("ad_cards").scrollIntoView({
        behavior: "smooth"
    });
}

// ================= DISPLAY STADIUM TAGS =================
function displayTags(data) {

    var container = document.getElementById("ad_stadiumTags");
    var html = "";

    container.innerHTML = "";

    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        html += "<div class='ad_tag' onclick='focusStadium(" + item.id + ", this)'>";
        html += item.stadium;
        html += "</div>";
    }

    container.innerHTML = html;
}

// ================= MOVE MAP TO STADIUM =================
function focusStadium(id, element) {

    // remove previous active tag
    var tags = document.getElementsByClassName("ad_tag");

    for (var j = 0; j < tags.length; j++) {
        tags[j].classList.remove("activeTag");
    }

    // add active style to clicked tag 
    element.classList.add("activeTag");


    // move map 
    for (var i = 0; i < locationsData.length; i++) {

        if (locationsData[i].id === id) {

            var loc = locationsData[i];

            ad_map.panTo({ lat: loc.lat, lng: loc.lng });
            ad_map.setZoom(13);

            document.getElementById("ad_mapSection").scrollIntoView({
                behavior: "smooth"
            });
        }
    }
}
// Start loading the page data.
loadData();
