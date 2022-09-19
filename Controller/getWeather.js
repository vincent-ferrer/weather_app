

async function getLocation(cityName) {
    let response = await fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+cityName+"&key=AIzaSyDdVJ6zE0-ZSqncFEb2H9oJe-hn05-kMqg");
    let data = await response.json();
    return data["results"][0]["geometry"]["location"];
}

async function getWeather(cityName) {
    location = getLocation()
    let response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=43.23&longitude=5.44&hourly=temperature_2m");
    let data = await response.text();
    console.log(data);
}

getLocation("Marseille");