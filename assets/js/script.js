//Variables
var apiKey = "3a5933df423b838589a35a8bafd45825";
var locLat, locLon;
var apiURL;
var uviURL;
var nameSearchURL;
var currentTemp;
var searchLoc;
var currentTime;
var date = new Date();
var weatherData = [''];

myLocation();

function myLocation() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

//Check if browser supports geolocation
function onError(){
    if (!navigator.geolocation) {
        console.error(`Your browser doesn't support Geolocation`);
    }
}

//On success, return current coordinates
function onSuccess(position) {
    locLat = Math.round((position.coords.latitude + Number.EPSILON) * 100) / 100;
    locLon = Math.round((position.coords.longitude + Number.EPSILON) * 100) / 100;
    apiURL = "https://api.openweathermap.org/data/2.5/weather?lat="+locLat+"&lon="+locLon+"&exclude=minutely,hourly,alerts&appid="+apiKey;
    uviURL = "https://api.openweathermap.org/data/2.5/uvi?lat="+locLat+"&lon="+locLon+"&appid="+apiKey;
    cityWeather();
    fiveDay();
}

//On failure, display error
function onError() {
    console.log(`Failed to get your location!`);
}

//Today's weather
function cityWeather(){
    fetch(apiURL).then(
    (response) => {return response.json();})
    .then(data => {        
        var location = data.name;
        var temperature = data.main.temp;
        var wind = data.wind.speed;
        var humidity = data.main.humidity;

        $('#location').text(location + " (" + date.toLocaleDateString('en-us', {year:"numeric", month:"numeric", day:"numeric"}) + ")");
        $("#favicon").attr('href','http://openweathermap.org/img/wn/'+ data.weather[0].icon +'.png');
        $('#weatherIcon').append("<img src='http://openweathermap.org/img/wn/"+ data.weather[0].icon +".png'></img>");
        $('#temperature').text("Temp: " + Math.round(((temperature-273.15)*1.8)+32) + "°F");
        $('#wind').text("Windspeed: " + wind + " mph");
        $('#humidity').text("Humidity: " + humidity + "%");

    });
    fetch(uviURL).then(
        (response) => {return response.json();})
        .then(data => {
            $('#UVI').text("UV Index: " + data.value);
    });
}

//Five day forecast
function fiveDay(){
    apiURL = apiURL.replace("/weather", "/forecast");
    apiURL += "&cnt=5";
    console.log(apiURL)
    fetch(apiURL).then(
        (response) => {return response.json();})
        .then(data => {
            for(var i = 0; i < 5; i++) {
                date.setDate(date.getDate() + 1);
                $('.fiveDayForecast').append(`
                <div class="card d-flex border border-2">
                    <div class="card-body">
                        <h3 id="date">`+ date.toLocaleDateString('en-us', {year:"numeric", month:"numeric", day:"numeric"}) +`</h3>
                        <div><img src="http://openweathermap.org/img/wn/`+ data.list[i].weather[0].icon +`.png"></div>
                        <div>Temp: `+ Math.round(((data.list[i].main.temp-273.15)*1.8)+32) + `°F</div>
                        <div>Wind: `+ data.list[i].wind.speed +`mph</div>
                        <div>Humidity: `+ data.list[i].main.humidity +`%</div>
                    </div>
                </div>
                `);
            }
        });
}

//General Search
function citySearch(){
    var city = $("#search").val();
    if(city == null || city == "" || city == " ")
    {
        //Modal pop up
    } else {
        saveCity(city);
        nameSearchURL = "https://api.openweathermap.org/data/2.5/weather?q="+ city +"&exclude=minutely,hourly,alerts&appid=3a5933df423b838589a35a8bafd45825";
        fetch(nameSearchURL).then(
            (response) => {return response.json();})
            .then(data => {
                coordSearch(data.coord);
        })
    }
}

function coordSearch(coords){
    locLat = Math.round((coords.lat + Number.EPSILON) * 100) / 100;
    locLon = Math.round((coords.lon + Number.EPSILON) * 100) / 100;
    apiURL = "https://api.openweathermap.org/data/2.5/weather?lat="+locLat+"&lon="+locLon+"&exclude=minutely,hourly,alerts&appid="+apiKey;
    uviURL = "https://api.openweathermap.org/data/2.5/uvi?lat="+locLat+"&lon="+locLon+"&appid="+apiKey;
    cityWeather();
    fiveDay();
}

//Saved locations
function saveCity(city){
    localStorage.setItem(city, city);
}

function recentSearches(){
    var cities = allStorage();
    if(cities.length > 0) {
        for(var j=0;j<cities.length;j++) {
            console.log()
            $("#myLocations").append(cities[j]);
        }
    }
}

function allStorage() {

    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;

    while ( i-- ) {
        values.push( localStorage.getItem(keys[i]) );
    }

    return values;
}

document.getElementById("search-addon").addEventListener("click", function(){
    $('.fiveDayForecast').empty();
    $('#weatherIcon').empty();
    date = new Date();
    citySearch();
}); 