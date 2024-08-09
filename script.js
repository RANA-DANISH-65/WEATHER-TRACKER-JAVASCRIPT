const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const inputValue = document.getElementById("user-input");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");

const API_key = "f62ca931594232feda59786cf4d0ce37"; // CUSTOM API KEY


const enableLoadingstate=()=>{
    inputValue.disabled=true;
    searchBtn.disabled=true;
    locationBtn.disabled=true;
    document.body.style.opacity="0.4"
}
const disableLoadingstate=()=>{
    inputValue.disabled=false;
    searchBtn.disabled=false;
    locationBtn.disabled=false;
    document.body.style.opacity="1"
    }

// FUNCTION TO CREATE HTML FOR WEATHER UPDATES
const createWeatherCard = (weatherItem, index, cityName) => {
  // CREATE HTML FOR CURRENT DATE WEATHER
  if (index === 0) {
    return ` <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                <h6>Humidity:${weatherItem.main.humidity} %</h6>
              </div>
              <div class="icon">
                <img src="https://openweathermap.org/img/wn/${ weatherItem.weather[0].icon}@4x.png" alt="Weather-image">
                <h4>${weatherItem.weather[0].description}</h4>
              </div>`;
  } else {
    // CREATE HTML FOR WEATHER CARDS
    return `<li class="card">
        <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img src="https://openweathermap.org/img/wn/${ weatherItem.weather[0].icon}@2x.png" alt="Weather-image">
        <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
        <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
        <h6>Humidity:  ${weatherItem.main.humidity} %</h6>
      </li>`;
  }
};

// FUNCTION TO GET WEATHER OF CITY
const getCityWeather = async (lat, lon, cityName) => {

    enableLoadingstate()

  // URL TO GET WEATHER OF CITY
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_key}`;

  try {
    let response = await fetch(WEATHER_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response.json();
    console.log(data)

    const uniqueForecastDays = []; // ARRAY TO STORE DAYS OF FORECAST
    const fiveDaysForecast = data.list.filter((forecast) => {
      // FILTER DAYS THAT ARE UNIQUE TO GET SINGLE FORECAST PER DAY
      const forecastDate = new Date(forecast.dt_txt).getDate(); // GETTING DATE
      if (!uniqueForecastDays.includes(forecastDate)) {
        // IF DATE IS UNIQUE ADD IT IN ARRAY
        uniqueForecastDays.push(forecastDate);
        return true;
      }
      return false;
    });

    inputValue.value = "";
    weatherCardsDiv.innerHTML = ""; // EMPTY THE DIV TO ADD ADJACENT HTML
    currentWeatherDiv.innerHTML = "";
    console.log(fiveDaysForecast)

    fiveDaysForecast.forEach((weatherItem, index) => {
      // LOOP TO CREATE HTML FOR EACH DATE
      if (index === 0) {
        currentWeatherDiv.insertAdjacentHTML(
          // ADDING CURRENT DATE IN UPPER DIV
          "beforeend",
          createWeatherCard(weatherItem, index, cityName)
        );
      } else {
        weatherCardsDiv.insertAdjacentHTML(
          "beforeend", // ADDING FORECAST DATES IN WEATHER CARDS
          createWeatherCard(weatherItem)
        );
      }
    });
  } catch (error) {
    disableLoadingstate()
    alert("An error occurred while fetching weather data.");
  }finally{
    disableLoadingstate()
  }

};

// FUNCTION TO GET LATITUDE AND LONGITUDE OF ENTERED CITY NAME
const getCityLocation = async () => {
    enableLoadingstate();


  let cityName = inputValue.value.trim(); // GET NAME FROM INPUT BOX THAT USER ENTERED
  if (!cityName){ // IN CASE USER DOESN'T ENTER CITY NAME
      disableLoadingstate();
      return alert("Please Enter City name");

}

  // URL TO GET LATITUDE AND LONGITUDE
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

  try {
    let response = await fetch(GEOCODING_API_URL); // FETCH RESPONSE
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // THROW ERROR IF RESPONSE IS NOT GOOD
    }
    let data = await response.json(); // GET DATA
    if (!data.length){ // IN CASE CITY NOT FOUND
        disableLoadingstate();
      return alert(`No Coordinates found for ${cityName}`);}

    const lat = data[0].lat;
    const lon = data[0].lon;
    const name = data[0].name;
    getCityWeather(lat, lon, name); // PASSING LONGITUDE, LATITUDE, AND CITY NAME TO FUNCTION TO GET WEATHER
  } catch (error) {
     disableLoadingstate();
    alert("An error occurred while fetching the Coordinates"); // CATCHING ERROR
  }
};

// FUNCTION TO GET CURRENT LOCATION OF USER 
const getUserLocation = () => {


  enableLoadingstate();


  navigator.geolocation.getCurrentPosition(
    (position) => {
      // GET USER LATITUDE AND LONGITUDE
      const user_latitude = position.coords.latitude;
      const user_longitude = position.coords.longitude;
      // API TO GET CITY NAME OF USER LOCATION
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${user_latitude}&lon=${user_longitude}&limit=1&appid=${API_key}`;
      fetch(REVERSE_GEOCODING_URL)
        .then((response) => response.json())
        .then((data) => {
          const cityName = data[0].name; // GET NAME OF CITY 
          // PASSING USERS LATITUDE AND LONGITUDE TO FUNCTION TO GET WEATHER
          getCityWeather(user_latitude, user_longitude, cityName);
        })
        .catch(() => {
            disableLoadingstate();
          alert("CANNOT FETCH YOUR CITY!");
        });
    },
    // IN CASE USER DOESN'T GRANT PERMISSION TO GET ITS LOCATION
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        disableLoadingstate();
        alert("Please grant permission to access your location.");
      }
    }
  );
};

searchBtn.addEventListener("click", getCityLocation); // Add event listener to search button
locationBtn.addEventListener("click", getUserLocation); // Add event listener to current location button
inputValue.addEventListener("keyup", (e) => e.key === "Enter" && getCityLocation()); // Add event listener so that when user presses enter, it should call the function


