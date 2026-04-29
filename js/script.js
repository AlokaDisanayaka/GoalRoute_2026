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

    // filter data
    var filtered = [];

    for (var i = 0; i < locationsData.length; i++) {

        if (locationsData[i].country === country) {
            filtered.push(locationsData[i]);
        }
    }

    // display filtered cards
    displayCards(filtered);
}

loadData();