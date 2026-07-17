// ==========================
// Weather harsh Forecast
// ==========================

const API_KEY = "50378b53c6fea2e1e67584d4bd6d9234";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const loader = document.getElementById("loader");

// Search Button
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city !== "") {
        getWeatherByCity(city);
    }
});

// Enter Key Search
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// Current Location
locationBtn.addEventListener("click", () => {
    getCurrentLocationWeather();
});

// Dark Mode
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        darkModeBtn.innerHTML = "☀️ Light Mode";
    }else{
        darkModeBtn.innerHTML = "🌙 Dark Mode";
    }
});

// ==========================
// Loader Functions
// ==========================

function showLoader(){
    loader.style.display = "flex";
}

function hideLoader(){
    loader.style.display = "none";
}

// ==========================
// Weather By City
// ==========================

async function getWeatherByCity(city){

    showLoader();

    try{

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        if(data.cod !== 200){
            alert("City Not Found");
            hideLoader();
            return;
        }

        updateCurrentWeather(data);

        getForecast(city);

        getAQI(data.coord.lat, data.coord.lon);

        loadMap(data.coord.lat, data.coord.lon);

    }catch(error){

        console.error(error);
        alert("Error Loading Weather");

    }

    hideLoader();
}

// ==========================
// Current Location Weather
// ==========================

function getCurrentLocationWeather(){

    if(!navigator.geolocation){
        alert("Geolocation Not Supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async(position)=>{

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            showLoader();

            try{

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );

                const data = await response.json();

                updateCurrentWeather(data);

                getAQI(lat, lon);

                loadMap(lat, lon);

            }catch(error){
                console.log(error);
            }

            hideLoader();

        }
    );
}

// ==========================
// Update Weather UI
// ==========================

function updateCurrentWeather(data){

    document.getElementById("cityName").innerText =
        `${data.name}, ${data.sys.country}`;

    document.getElementById("temperature").innerText =
        `${Math.round(data.main.temp)}°C`;

    document.getElementById("weatherDescription").innerText =
        data.weather[0].description;

    document.getElementById("humidity").innerText =
        `${data.main.humidity}%`;

    document.getElementById("windSpeed").innerText =
        `${data.wind.speed} km/h`;

    document.getElementById("pressure").innerText =
        `${data.main.pressure} hPa`;

    document.getElementById("feelsLike").innerText =
        `${Math.round(data.main.feels_like)}°C`;

    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    document.getElementById("sunrise").innerText =
        new Date(data.sys.sunrise * 1000).toLocaleTimeString();

    document.getElementById("sunset").innerText =
        new Date(data.sys.sunset * 1000).toLocaleTimeString();
}

// ==========================
// 7 Day Forecast
// ==========================

async function getForecast(city){

    // One Call API or Forecast API
    // Add your preferred forecast endpoint here

    const forecastContainer =
        document.getElementById("forecastContainer");

    forecastContainer.innerHTML = "";

    for(let i = 1; i <= 7; i++){

        forecastContainer.innerHTML += `
            <div class="forecast-card">
                <h4>Day ${i}</h4>
                <p>25°C</p>
                <p>Cloudy</p>
            </div>
        `;
    }
}

// ==========================
// AQI
// ==========================

async function getAQI(lat, lon){

    try{

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        const data = await response.json();

        const aqi = data.list[0].main.aqi;

        document.getElementById("aqiValue").innerText = aqi;

        const status = [
            "",
            "Good",
            "Fair",
            "Moderate",
            "Poor",
            "Very Poor"
        ];

        document.getElementById("aqiStatus").innerText =
            status[aqi];

    }catch(error){
        console.log(error);
    }
}

// ==========================
// Weather Map
// ==========================

let map;

function loadMap(lat, lon){

    if(map){
        map.remove();
    }

    map = L.map("map").setView([lat, lon], 10);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(map);

    L.marker([lat, lon]).addTo(map);
}

// ==========================
// Initial Load
// ==========================

window.addEventListener("load", () => {

    hideLoader();

    getCurrentLocationWeather();

});