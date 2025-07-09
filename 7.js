const userTab = document.querySelector("[data-weather]");
const searchTab = document.querySelector("[data-search]");
const form = document.querySelector("[data-form]");

const grantLocContainer = document.querySelector("[grant-loc-container]");
const userInfoContainer = document.querySelector("[user-info-container]");
const loadingScreen = document.querySelector("[loading-container]");
const formInput = document.querySelector("[data-input]");
const grantAccessBtn = document.querySelector("[data-grantaccess]");

let currTab = userTab;
grantLocContainer.classList.add("active");
userInfoContainer.classList.remove("active");
const API_KEY = "96c5da3a90379fed099279f536bef7ce";

currTab.classList.add("current-tab");
let i=0;
// Switch tab function
function switchTab(clickedTab) {
    if (clickedTab !== currTab) {
        currTab.classList.remove("current-tab");
        currTab = clickedTab;
        currTab.classList.add("current-tab");

        if (currTab === searchTab) {
            form.classList.add("active");
            grantLocContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
        } else {
            form.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
            
        }
    }
}

// Tab event listeners
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Load stored location
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        grantLocContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
         grantLocContainer.classList.remove("active");
        fetchWeatherInfo(coordinates);
    }
}

// Get weather info using coordinates
async function fetchWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    grantLocContainer.classList.remove("active");
    userInfoContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        loadingScreen.classList.remove("active");
        alert("Failed to fetch weather. Try again.");
    }
}

// Render UI with weather info
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-cityIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-clouds]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}@2x.png`;
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    clouds.innerText = `${weatherInfo?.clouds?.all}%`;
}

// Geolocation logic
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, () => {
            alert("Permission denied. Please allow location access.");
        });
    } else {
        alert("Geolocation not supported by your browser.");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
    grantLocContainer.classList.remove("active");
}

// Handle "Grant Access" click
grantAccessBtn.addEventListener("click", getLocation);

// Handle search form submit
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = formInput.value.trim();
    if (city === "") return;
    fetchSearchWeatherInfo(city);
});

// Fetch weather using searched city name
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantLocContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (data.cod === "404") {
            alert("City not found");
            loadingScreen.classList.remove("active");
            return;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (err) {
        loadingScreen.classList.remove("active");
        alert("Something went wrong while fetching weather.");
    }
}
