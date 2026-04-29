var locationsData = [];

// ================= LOAD JSON =================
function loadData() {

    fetch("json/data.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            // store data globally
            locationsData = data.locations;

            // display all cards initially
            displayCards(locationsData);
        });
}


// ================= DISPLAY CARDS =================
function displayCards(data) {

    var container = document.getElementById("ad_cardsContainer");

    // clear existing cards
    container.innerHTML = "";

    // loop through data
    for (var i = 0; i < data.length; i++) {

        var item = data[i];

        // create card HTML
        var card = `
            <div class="ad_card">
            <div class="ad_cardTitle">${item.city} - ${item.stadium}</div>
                <img src="${item.image}" alt="${item.city}">

                <div class="ad_cardContent">

                    <div class="ad_cardTitle">${item.city}</div>

                    <p>${item.description}</p>

                    <div class="ad_price">$${item.price} avg/night</div>

                </div>

            </div>
        `;

        // add to container
        container.innerHTML += card;
    }
}


// ================= FILTER BY COUNTRY =================
function selectCountry(country) {

    var filtered = [];

    for (var i = 0; i < locationsData.length; i++) {

        if (locationsData[i].country === country) {
            filtered.push(locationsData[i]);
        }
    }

    displayCards(filtered);

    // Move map based on country
    if (country === "usa") {
        ad_map.setCenter({ lat: 37.0902, lng: -95.7129 });
        ad_map.setZoom(4);
    }

    if (country === "canada") {
        ad_map.setCenter({ lat: 56.1304, lng: -106.3468 });
        ad_map.setZoom(4);
    }

    if (country === "mexico") {
        ad_map.setCenter({ lat: 23.6345, lng: -102.5528 });
        ad_map.setZoom(5);
    }
}

loadData();