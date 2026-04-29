// ================= TOGGLE MENU (MOBILE) =================
function toggleMenu() {

    // Get menu element
    var menu = document.querySelector(".ad_menu");

    // Toggle visibility
    if (menu.style.display === "block") 
    {
        menu.style.display = "none";
    } 
    else 
    {
        menu.style.display = "block";
    }
}


// ================= COUNTRY SELECTION =================
function selectCountry(country) {

    // For now just log 
    console.log("Selected country:", country);

    // FUTURE:
    // 1. Filter JSON data
    // 2. Update cards
    // 3. Move Google Map
}